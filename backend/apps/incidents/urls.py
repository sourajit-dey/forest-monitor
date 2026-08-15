from django.urls import path
from .views import (
    IncidentListView,
    IncidentDetailView,
    IncidentGeoJSONView,
    GenerateReportView
)

urlpatterns = [
    path('incidents/', IncidentListView.as_view(), name='incident-list'),
    path('incidents/<int:pk>/', IncidentDetailView.as_view(), name='incident-detail'),
    path('incidents/<int:pk>/geojson/', IncidentGeoJSONView.as_view(), name='incident-geojson'),
    path('incidents/<int:pk>/generate-report/', GenerateReportView.as_view(), name='incident-generate-report'),
]
