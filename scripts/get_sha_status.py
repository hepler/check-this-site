"""Script to find SHA2 status for each site.

Scrapes SHA2 checker to get the status.

Usage
-----

./manage.py runscript get_sha_status

"""

import os
from pyquery import PyQuery as pq
from urlparse import urlparse
import requests

from api.models import *


def run():
    """Entry point for script."""

    orgs = Organization.objects.all()

    for org in orgs:
        # iterate through the db
        try:
            parsed = urlparse(org.website)
            url = '{uri.netloc}'.format(uri=parsed)
            domain = 'https://www.sha2sslchecker.com/' + url
            response = requests.get(domain)
            doc = pq(response.content)
            sha2 = doc('.sha2')
            sha_support = False
            if(sha2):
                sha_support = True
            enc = EncryptionSupport(sha_status=sha_support)
            enc.save()
            org.encryption_support = enc
        except:
            print '* error getting sha status'
            print org.website
            print
