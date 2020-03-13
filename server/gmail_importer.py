import arrow
import os
import re
import requests
from bs4 import BeautifulSoup
from imbox import Imbox

from server.models import Activity, Project, Task, ImportedEmail
from django.contrib.auth import get_user_model
from django.conf import settings

TMP_DIR = "./tmp"
user = getattr(settings, 'GMAIL_USERNAME', '')
password = getattr(settings, 'GMAIL_PASSWORD', '')


def get_or_create_project(user):
  for project in Project.objects.filter(user=user):
    if project.data['name'] == 'Workout':
      return project
  return Project.objects.create(user=user, data={'name': 'Workout'})


def get_or_create_activity(user):
  project = get_or_create_project(user)
  for activity in Activity.objects.filter(user=user):
    if activity.data['name'] == 'Spinning':
      return activity
  return Activity.objects.create(user=user, data={'name': 'Spinning', 'project': project.id})


def process_all():
  count = 0
  for email in ImportedEmail.objects.filter(status='new'):
    data = parse_revel(email.content)
    if data:
      user, new = get_user_model().objects.get_or_create(email=email.from_email)
      match = re.compile(r'(\w{3}) (\d+)\S+ (\d+):(\d+) (AM|PM)').match(data['hdate'])
      if not match:
        raise NotImplementedError('fail email with note about bad date')
      mon, day, hour, minute, ampm = match.groups()
      year = arrow.get().year
      s = "{} {} {} {}:{:02d} {} +05:00".format(year, mon, day, hour, int(minute), ampm)
      start = arrow.get(s, "YYYY MMM D h:mm A ZZ")
      finish = start.shift(minutes=data['minutes'])
      data['started'] = data['due'] = start.timestamp * 1000
      data['completed'] = finish.timestamp * 1000
      data['project'] = get_or_create_project(user).id
      data['activity'] = get_or_create_activity(user).id
      data['name'] = "Spinning"
      Task.objects.create(user=user, data=data)
      email.status = 'completed'
    else:
      email.status = 'rejected'
      email.status_note = 'parse_revel returned no data'
    email.save()
    count += 1
  print(f'processed {count} emails')


# TODO after db is created, this should be part of an email model
def download():
  google_ids = ImportedEmail.objects.values_list("google_id", flat=True)
  count = 0
  # TODO only get past 24 hours?
  with Imbox("imap.gmail.com", user, password) as imbox:
    for google_id, message in imbox.messages():
      google_id = google_id.decode()
      if google_id in google_ids:
        continue
      if message.body['plain']:
        ImportedEmail.objects.create(
          subject=message.subject,
          content=message.body['plain'][0],
          google_id=google_id,
          attachment_number=0,
          source_email=user,
          from_email=message.sent_to[0]['email'],
        )
      for num, content in enumerate(message.body['html']):
        ImportedEmail.objects.create(
          subject=message.subject,
          content=content,
          google_id=google_id,
          attachment_number=num + 1,
          source_email=user,
          from_email=message.sent_from[0]['email'],
        )
        count += 1


# TODO just a guess at how this will work
# it looks like gmail's verify feature just asks you to post to a given form
def verify_forward_allow(content):
  # if not "Gmail Forwarding Confirmation" in messsage.subject:
  if not "has requested to automatically forward mail" in content:
    return
  soup = BeautifulSoup(content, 'html.parser')
  a = soup.select('[href^="https://mail-settings"]')[0]
  response = requests.post(a.href)
  response.raise_for_status()
  return (response.text)


def direct(key, value):
  return {key: value}


def avemax(key):
  return lambda _key, value: dict(zip([f'ave_{key}', f'max_{key}'], value.split(" / ")))


def noop(key, value):
  return {}


def _int(value):
  value = value.strip()
  if not value.isdigit():
    return value
  if '.' in value:
    return float(value)
  return int(value)


def rename(new_key):
  return lambda key, value: {new_key: value}


maps = {
  "Workout Results": rename("hdate"),
  "calories": direct,
  "points": direct,
  "avg/max mph": avemax('mph'),
  "distance": direct,
  "avg/max rpm": avemax('rpm'),
  "avg/max watts": avemax('watts'),
  "rank": direct,
  "avg/max hr": avemax('hr'),
}


def parse_revel(content):
  if not "http://revel-ride.com" in content:
    return
  soup = BeautifulSoup(content, 'html.parser')
  stats = {}
  for img in soup.select("img.fr-fic.fr-dii"):
    parent = img.parent()
    value = parent[1].text
    name = parent[2].text
    if name in maps:
      stats.update(maps[name](name, value))
  if not stats:
    return
  stats = {key: _int(value) for key, value in stats.items()}
  stats['zone_minutes'] = [_int(z.text) for z in soup.select("#resultMinutesInZones")[0].select(".zone-wrap")]
  stats['minutes'] = sum(stats['zone_minutes'])
  stats['instructor'] = soup.select("hr + table")[0].select("td p")[-1].text
  return stats


# for fname in os.listdir(TMP_DIR)[1:]:
#     with open(os.path.join(TMP_DIR, fname), 'r') as f:
#         content = f.read()
#         print(parse_revel(content)['minutes'])
