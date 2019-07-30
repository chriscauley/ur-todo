import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DEBUG = True
SITE_ID = 1
SECRET_KEY = "n9)&^*bb+ey^)5kd(uc0@*z4=*=$agdq%c^_22xs+d@3hhgd7b"

ALLOWED_HOSTS = [
  "todo.imisspaint.com",
  "ih.imisspaint.com",
  "mac.imisspaint.com",
  "phone.imisspaint.com",
]

MIDDLEWARE = [
  "django.middleware.security.SecurityMiddleware",
  "django.contrib.sessions.middleware.SessionMiddleware",
  "django.middleware.common.CommonMiddleware",
  "django.middleware.csrf.CsrfViewMiddleware",
  "django.contrib.auth.middleware.AuthenticationMiddleware",
  "django.contrib.messages.middleware.MessageMiddleware",
  "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "server.urls"

TEMPLATES = [{
  "BACKEND": "django.template.backends.django.DjangoTemplates",
  "DIRS": [],
  "APP_DIRS": True,
  "OPTIONS": {
    "context_processors": [
      "django.template.context_processors.debug",
      "django.template.context_processors.request",
      "django.contrib.auth.context_processors.auth",
      "django.contrib.messages.context_processors.messages",
    ]
  },
}]

WSGI_APPLICATION = "server.wsgi.application"

# Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases

DATABASES = {
  "default": {
    "ENGINE": "django.db.backends.postgresql_psycopg2",
    "NAME": "ur-todo"
  }
}

# Password validation
# https://docs.djangoproject.com/en/2.1/ref/settings/#auth-password-validators

_V = "django.contrib.auth.password_validation"
AUTH_PASSWORD_VALIDATORS = [
  {
    "NAME": _V + ".UserAttributeSimilarityValidator"
  },
  {
    "NAME": _V + ".MinimumLengthValidator"
  },
  {
    "NAME": _V + ".CommonPasswordValidator"
  },
  {
    "NAME": _V + ".NumericPasswordValidator"
  },
]

# Internationalization
# https://docs.djangoproject.com/en/2.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.1/howto/static-files/

STATIC_URL = "/static/"
DIST_DIR = os.path.join(BASE_DIR, "../dist")
STATICFILES_DIRS = [DIST_DIR, os.path.join(BASE_DIR, "static")]

LOGGING = {
  "version": 1,
  "disable_existing_loggers": False,
  "handlers": {
    "null": {
      "class": "logging.NullHandler"
    }
  },
  "loggers": {
    "django.security.DisallowedHost": {
      "handlers": ["null"],
      "propagate": False
    }
  },
}
