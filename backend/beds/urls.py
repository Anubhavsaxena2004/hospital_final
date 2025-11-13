from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BedViewSet, BedStatsView

router = DefaultRouter()
router.register(r'beds', BedViewSet, basename='bed')

urlpatterns = [
    path('', include(router.urls)),
    path('beds/stats/', BedStatsView.as_view(), name='bed_stats'),
]
