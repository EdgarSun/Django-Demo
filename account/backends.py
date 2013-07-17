from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User

class EmailAuthBackEnd(ModelBackend):
    """Allows a user to login using their email address, and not just their
    username. This is a lot more common than a new username. Some things that
    it takes care of for you are:

    - Allow _either_ username or email to be used
    - Allow anyone marked as staff in the database to mascquerade as another
      user by using the user they want to masquerade as as the username and
      using <username>/<password> in the password field, where <username>
      is _their_ username."""

    def _lookup_user(self, username):
        try:
            if '@' in username:
                user = User.objects.get(idxf_email_l_iexact=username.lower())
            else:
                return None
        except User.DoesNotExist:
            return None
        return user
            
    def authenticate(self, username=None, password=None,nopass=False):
        user = self._lookup_user(username)
        if user:
            if nopass:#only for "auto login user after registering"
                return user
            if user.check_password(password):
                return user
            elif '/' in password:
                proposed_user = user    # Who we want to be
                (username, password) = password.split('/', 1)
                user = self._lookup_user(username)
                if user and user.is_staff:
                    if user.check_password(password):
                        return proposed_user
        return None