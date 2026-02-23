# my_app/views.py

from django.shortcuts import render
from django.http import HttpResponse

def home(request):
    """
    A simple view that returns an HTTP response with a string.
    """
    return HttpResponse("Hello, world. You're at the home page.")

def welcome_page(request):
    """
    A view that renders a template.
    Make sure you have a 'my_app/welcome.html' template file configured 
    in your project's template settings.
    """
    context = {'message': 'Welcome to my app!'}
    return render(request, 'welcome.html', context)
