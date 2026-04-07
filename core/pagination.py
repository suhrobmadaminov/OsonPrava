"""
Custom Pagination for OsonPrava
Equivalent to NestJS PaginationDto
"""
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from collections import OrderedDict


class StandardPagination(PageNumberPagination):
    """
    Standard pagination for API endpoints
    Default: 20 items per page
    Max: 100 items per page
    """
    page_size = 20
    page_size_query_param = 'limit'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('data', data),
            ('meta', OrderedDict([
                ('total', self.page.paginator.count),
                ('page', self.page.number),
                ('limit', self.page_size),
                ('total_pages', self.page.paginator.num_pages),
            ]))
        ]))


def paginate_queryset(queryset, request, view, pagination_class=StandardPagination):
    """
    Helper function to paginate a queryset
    Returns (paginated_data, pagination_info)
    """
    paginator = pagination_class()
    page = paginator.paginate_queryset(queryset, request, view)
    
    if page is not None:
        serializer = view.get_serializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    return None
