import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { Luv2shopFormService } from 'src/app/services/luv2shop-form.service';
import { Luv2ShopValidators } from 'src/app/validators/luv2-shop-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder, 
              private luv2shopFormService: Luv2shopFormService) { }

  ngOnInit(): void {

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        email: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace])
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: ['']
      })
    });


    // populate credit card months

    const startMonth: number = new Date().getMonth() + 1;
    console.log("start month: " + startMonth);

    this.luv2shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrived credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

    // populate credit card years

    this.luv2shopFormService.getCreditCardYears().subscribe(
      data => {
        console.log("Retrived credit card years: " + JSON.stringify(data));
        this.creditCardYears = data;
      }
    );

    // populate countries

    this.luv2shopFormService.getCountries().subscribe(
      data => {
        console.log("Retrived countries: " + JSON.stringify(data));
        this.countries = data;
      }
    );

  }

  // form control getter methods

  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }

  get shippingAddrStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddrCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddrState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddrCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }
  get shippingAddrZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }

  get billingAddrStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddrCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddrState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddrCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }
  get billingAddrZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }
  

  copyShipping2Billing(event) {
    
    if (event.target.checked) {
      this.checkoutFormGroup.controls["billingAddress"].setValue(this.checkoutFormGroup.controls["shippingAddress"].value);

      this.billingAddressStates = this.shippingAddressStates;
    }
    else {
      this.checkoutFormGroup.controls["billingAddress"].reset();

      this.billingAddressStates = [];
    }
  }

  onSubmit() {
    console.log("Handling the submit button")

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
    }

    console.log(this.checkoutFormGroup.get('customer')?.value)  // in json
    console.log("The shipping address country is " + this.checkoutFormGroup.get('shippingAddress').value.country.name);
    console.log("The shipping address state is " + this.checkoutFormGroup.get('shippingAddress').value.state.name);

  }

  handleMonthsAndYears() {

    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup.value.expirationYear);

    // if the current year equals the selected year, then start with the current month

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    }
    else {
      startMonth = 1;
    }

    this.luv2shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrived credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
  }

  getStates(formGroupName: string) {

    const formGroup = this.checkoutFormGroup.get(formGroupName);
    
    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.luv2shopFormService.getStates(countryCode).subscribe(
      data => {

        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        }
        else {
          this.billingAddressStates = data;
        }

        // select first item by default
        formGroup.get('state').setValue(data[0]);
      }
    );
  }
}
