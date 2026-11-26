from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('refresh/', views.RefreshView.as_view(), name='refresh'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('me/', views.MeView.as_view(), name='me'),
    path('google/', views.GoogleLoginView.as_view(), name='google_login'),
    path('set-password/', views.SetPasswordView.as_view(), name='set_password'),
    path(
        'password-reset/',
        views.PasswordResetRequestView.as_view(),
        name='password_reset',
    ),
    path(
        'password-reset/confirm/',
        views.PasswordResetConfirmView.as_view(),
        name='password_reset_confirm',
    ),
]