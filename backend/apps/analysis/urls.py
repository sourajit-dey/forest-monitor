from django.urls import path
from .views import AnalyzeView, RiskMapView

urlpatterns = [
    path('analyze/', AnalyzeView.as_view(), name='analyze'),
    path('risk-map/', RiskMapView.as_view(), name='risk-map'),
]
