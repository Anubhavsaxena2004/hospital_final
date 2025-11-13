from rest_framework import viewsets, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from .models import Bed
from .serializers import BedSerializer, BedListSerializer
from hospital_management.mixins import MultiTenantViewSetMixin


class BedViewSet(MultiTenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Bed.objects.all()
    serializer_class = BedListSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update', 'retrieve']:
            return BedSerializer
        return BedListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        bed_type = self.request.query_params.get('bed_type')
        occupied = self.request.query_params.get('occupied')
        search = self.request.query_params.get('search')

        if bed_type:
            queryset = queryset.filter(bed_type=bed_type)
        if occupied is not None:
            is_occ = occupied.lower() == 'true'
            queryset = queryset.filter(is_occupied=is_occ)
        if search:
            queryset = queryset.filter(Q(bed_number__icontains=search) | Q(notes__icontains=search))
        return queryset


class BedStatsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        hospital = getattr(request, 'hospital', None)
        if not hospital:
            return Response({'error': 'No hospital context found.'}, status=400)

        beds = Bed.objects.filter(hospital=hospital)
        total_by_type = beds.values('bed_type').annotate(total=Count('id'))
        occupied_by_type = beds.filter(is_occupied=True).values('bed_type').annotate(total=Count('id'))

        def to_map(items):
            res = {}
            for item in items:
                res[item['bed_type']] = item['total']
            return res

        totals = to_map(total_by_type)
        occupied = to_map(occupied_by_type)

        data = {}
        for bed_type in ['general', 'icu', 'emergency', 'pediatric', 'private']:
            total = totals.get(bed_type, 0)
            occ = occupied.get(bed_type, 0)
            data[bed_type] = {
                'total': total,
                'occupied': occ,
                'available': max(total - occ, 0)
            }

        return Response({'beds': data, 'hospital_name': hospital.name})
