from django.contrib import admin
from analytics.admin import admin_site
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    path('analytics/', include('analytics.urls')),
    path('', include('base.urls')),
    path('cart/', include('cart.urls', namespace='cart')),
    path('payment/', include('payments.urls', namespace='payments')),
    path('user/', include('userauths.urls', namespace='userauths')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root = settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)