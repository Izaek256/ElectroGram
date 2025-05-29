from django import forms
from .models import DeliveryAddress

class DeliveryAddressForm(forms.ModelForm):
    delivery_full_name = forms.CharField(
        label="Full name*",
        max_length=100,
        widget=forms.TextInput(attrs={'class': 'input-text input-text--primary-style', 'placeholder': 'Full Name'}),
        required=True
    )
    delivery_email = forms.EmailField(
        label="Email*",
        max_length=100,
        widget=forms.TextInput(attrs={'class': 'input-text input-text--primary-style', 'placeholder': 'Email'}),
        required=True
    )
    delivery_address = forms.CharField(
        label="Delivery Address*",
        max_length=100,
        widget=forms.TextInput(attrs={'class': 'input-text input-text--primary-style', 'placeholder': 'Address'}),
        required=True
    )
    delivery_phone_number = forms.CharField(
        label="Enter Active Whatsapp number",
        max_length=15,
        widget=forms.TextInput(attrs={
            'class': 'input-text input-text--primary-style',
            'placeholder': 'Enter 9 digits (e.g., 752235731)',
            'pattern': '[0-9]{9}',
            'title': 'Enter 9 digits without the country code'
        }),
        required=True,
        help_text='Enter 9 digits without the country code. The +256 prefix will be added automatically.'
    )
    delivery_city = forms.CharField(
        label="City*",
        max_length=100,
        widget=forms.TextInput(attrs={'class': 'input-text input-text--primary-style', 'placeholder': 'City'}),
        required=True
    )
    delivery_district = forms.CharField(
        label="District*",
        max_length=100,
        widget=forms.TextInput(attrs={'class': 'input-text input-text--primary-style', 'placeholder': 'District'}),
        required=True
    )
    details_about_address = forms.CharField(
        label="More Details*",
        max_length=100,
        widget=forms.TextInput(attrs={'class': 'input-text input-text--primary-style', 'placeholder': 'Details'}),
        required=True
    )

    class Meta:
        model = DeliveryAddress
        fields = [
            'delivery_full_name', 'delivery_email', 'delivery_address',
            'delivery_phone_number', 'delivery_city', 'delivery_district',
            'details_about_address'
        ]

    def clean_user(self):
        user = self.cleaned_data.get('user')
        if not user:
            raise forms.ValidationError("User is required.")
        return user

    def clean_delivery_phone_number(self):
        phone_number = self.cleaned_data.get('delivery_phone_number')
        # Remove any spaces or special characters
        phone_number = ''.join(filter(str.isdigit, phone_number))
        
        # Check if the number is exactly 9 digits
        if len(phone_number) != 9:
            raise forms.ValidationError("Phone number must be exactly 9 digits.")
        
        # Add the +256 prefix and ensure it's in E.164 format
        formatted_number = f"+256{phone_number}"
        
        # Validate the final number length (should be 13 characters: +256 + 9 digits)
        if len(formatted_number) != 13:
            raise forms.ValidationError("Invalid phone number format.")
            
        return formatted_number
