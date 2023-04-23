Writing forms is probably one of the most time-consuming tasks in front-end development. There are several libraries (like react-hook-form) that can help reduce some of the coding required, but I have a habit of not trusting packages.

They say "don't reinvent the wheel," but sometimes the wheel is not up to your standards or does not support your specific use-case. When it comes to form validation, it's important that you 1.) assert proper data types and constraints, and 2.) not detract from the user experience in doing so.

That being said, this tutorial will focus on how you can create your own reusable universal form controller to use across your app. The code in this tutorial is based on an example project written in Next.js / TypeScript. You can find a link to the demo site and repo at the bottom of this article.

---

## Dependencies

This tutorial will use the following dependencies:

| Package Name | Purpose |
| --------------- | -------- |
| yup | Dead simple Object schema validation |
| yup-password | Password plugin for yup |
| react-scroll | For animating scrolling to erroneous elements |
| react-input-mask | Masking library for input fields |
| tailwindcss | A utility-first CSS framework for rapidly building custom user interfaces. |

To install corresponding types:

```bash
npm i -D @types/react-input-mask @types/uuid \
@types/node @types/react @types/react-dom @types/react-scroll
```

---

## The Code

The following code defines a custom hook called `useForm` which manages form state, validation, and submission. It takes in several props including a `FormComponent`, `initialFormData`, `schema`, `handleSubmi`t, and `isLoading`. It sets up state variables for `formData` and `errors` and handles input change events for the form fields. It also validates the form using the provided Yup schema and provides functions to get form data, reset the form, and validate the form. Finally, it returns a render function that renders the `FormComponent` with the necessary props, including any form component props passed in.

```tsx
/**
 * useForm is a custom hook to manage form state, validation, and submission.
 * @author Jay Simons
 *
 */
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { scroller } from 'react-scroll';
import * as Yup from 'yup';

type FormProps = {
    FormComponent: React.FC<any>,
    formComponentProps?: FormComponentProps,
    initialFormData: FormData,
    schema: Yup.Schema<FormData>,
    handleSubmit: (e: FormEvent) => Promise<void>,
    isLoading: boolean
};

type FormData = {
    [key: string]: any;
};

type FormComponentProps = {
    formData: FormData;
    handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
    errors: { [key: string]: string };
    handleSubmit: (e: FormEvent) => Promise<void>;
};

export default function useForm(props: FormProps) {
    const {
        FormComponent,
        formComponentProps,
        initialFormData,
        schema,
        handleSubmit,
        isLoading
    } = props;

    // Initialize errors object with empty string values for each form field
    const initialErrors: { [key: string]: string } = {};
    for (const k in initialFormData) {
        initialErrors[k] = '';
    }

    // Set up state variables for formData and errors
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<{ [key: string]: string }>(
        initialErrors
    );

    // Handle input change events for the form fields
    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    }

    // Validate the form using the Yup schema
    async function validateForm(): Promise<boolean> {
        // Reset errors object
        setErrors(initialErrors);
        try {
            await schema.validate(formData, { abortEarly: false });
            return true;
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                // Retrieve the first validation error and its associated form field
                const errField = err?.inner[0]?.path || '' as string;
                const errMess = err.errors[0];
                // Scroll to the form field and display the validation error message
                scroller.scrollTo(errField, {
                    duration: 700,
                    delay: 100,
                    smooth: true,
                    offset: -50
                });
                // Log the error to the console and update the errors object
                console.error(errField, errMess);
                setErrors((oldData) => ({
                    ...oldData,
                    [errField]: errMess
                }));
            }
            return false;
        }
    }

    function getFormData(): FormData {
        return formData;
    }

    function resetForm() {
        setFormData(initialFormData);
        setErrors(initialErrors);
    }

    const assignProps = {
        formData,
        handleInputChange,
        errors,
        handleSubmit
    }

    function render() {
        return (
            <div className={`w-full relative ${isLoading ? 'opacity-60' : ''}`}>
                {isLoading ? (
                    /* Cover the screen to prevent actions while loading */
                    <div className="absolute top-0 right-0 bottom-0 left-0 z-10 bg-black/20"></div>
                ) : (
                    <></>
                )}
                <FormComponent {...assignProps} {...formComponentProps}
                />
            </div>
        );
    }

    return {
        getFormData,
        setFormData,
        render,
        resetForm,
        validateForm
    };
}
```

---

## Usage

Now to put all our hard work into action! Here is an example form component:

```tsx
import React, { FormEvent, ChangeEvent } from 'react'
import { Element } from 'react-scroll';
import InputMask from 'react-input-mask';

import { FormData } from '@/interfaces/FormData'

interface TheFormProps {
    formData: FormData;
    handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
    errors: { [key: string]: string };
}

export default function TheForm({
    formData,
    handleInputChange,
    handleSubmit,
    errors,
}: TheFormProps) {
    const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        const formattedValue = value.replace(/[^\d]/g, '').substring(0, 10);
        handleInputChange(event);
        event.target.value = formattedValue;
    }

    return (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-4">
                <Element name="fullName">
                    <input
                        className="input-base"
                        type="text"
                        name="fullName"
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        value={formData.fullName}
                    />
                    {errors.fullName && <p className="text-red-500">{errors.fullName}</p>}
                </Element>
                <Element name="email">
                    <input
                        className="input-base"
                        type="email"
                        name="email"
                        onChange={handleInputChange}
                        placeholder="Email Address"
                        value={formData.email}
                    />
                    {errors.email && <p className="text-red-500">{errors.email}</p>}
                </Element>
                <Element name="phone">
                    <InputMask
                        mask="(999) 999-9999"
                        className="input-base"
                        type="tel"
                        name="phone"
                        onChange={handlePhoneChange}
                        placeholder="Phone Number"
                        value={formData.phone}
                    />
                    {errors.phone && <p className="text-red-500">{errors.phone}</p>}
                </Element>
                <Element name="password">
                    <input
                        className="input-base"
                        type="password"
                        name="password"
                        onChange={handleInputChange}
                        placeholder="Password"
                        value={formData.password}
                    />
                    {errors.password && <p className="text-red-500">{errors.password}</p>}
                </Element>
            </div>
        </form>
    )
}
```

We receive our `formData` state and handlers from the HOC, which implements `useForm`. Note that each input element is wrapped in the `<Element>` with `name=` as a prop. This allows our validation function to use `react-scroll` to smoothly scroll to the erroneous input. Also note that the phone input is using `InputMask` to assert the desired format of our phone number. These are not necessary for this tutorial, but I thought I'd throw them in as a bonus. 🙂

Next is our HOC that puts it all together:

```tsx
import { useState, FormEvent, ChangeEventHandler } from "react"
import Link from "next/link"
import TheForm from "@/components/TheForm"
import Switch from "@/components/UI/Switch"

import formSchema from "@/schema/formSchema"
import useForm from "@/hooks/useForm"


const initialFormData = {
  fullName: '',
  email: '',
  phone: '',
  password: ''
}

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [disableClientValidation, setDisableClientValidation] = useState<boolean>(false);
  const [serverResponse, setServerResponse] = useState<string | null>(null);
  const [responseCode, setResponseCode] = useState<number>(0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = getFormData();

    // Validate form
    if (!disableClientValidation) {
      if (! await validateForm()) return;
    }

    setIsLoading(true);
    const result = await fetch('/api/form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    // Get response code
    const responseCode = result.status;
    setResponseCode(responseCode);
    // Set response to state
    const serverResponse = await result.json();
    setServerResponse(serverResponse);
    setIsLoading(false);
  }

  const { render, getFormData, setFormData, validateForm, resetForm } = useForm({
    FormComponent: TheForm,
    initialFormData: initialFormData,
    schema: formSchema,
    handleSubmit: handleSubmit,
    isLoading: isLoading
  });

  const handleDisableClientValidation = () => {
    setDisableClientValidation(old => !old);
  }

  return (
    <div className="px-4 flex flex-col min-h-screen w-full bg-gradient-to-b from-slate-300 to-slate-200">
      <div className="flex flex-col gap-6 md:w-[800px] mx-auto py-20">
        <h1 className="text-3xl font-bold text-center">React Hook Form Example</h1>
        <p>This form uses the Yup library for validation and the back-end is handled by Next.js&apos;s new Edge runtime.</p>
        {
          serverResponse
            ?
            <div className="flex flex-col gap-8">
              <h2 className="text-xl font-bold text-center">Server Response</h2>
              <pre className={`${responseCode !== 200 ? 'text-red-500' : 'text-green-500'} bg-[#1e1e1e] p-4 rounded-md`}>
                {JSON.stringify(serverResponse,  null, 2)}
              </pre>
              <button
                type="button"
                className="px-4 py-2 bg-green-500 text-white rounded-md w-fit"
                onClick={() => setServerResponse(null)}
              >Try Again</button>
            </div>
            :
            <>
              {render()}
              <div className="flex gap-6 flex-wrap">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                  onClick={handleSubmit}
                >Submit</button>
                <button
                  type="button"
                  className="px-4 py-2 bg-green-500 text-white rounded-md"
                  onClick={resetForm}
                >Reset</button>
                <Switch
                  label="Disable Client Validation"
                  onChange={handleDisableClientValidation}
                  checked={disableClientValidation}
                />
              </div>
            </>
        }
      </div>
      <footer className="mt-auto mb-6">
        <p className="text-center text-sm font-mono">Created by{' '}
          <Link
            className="text-sky-600"
            href="https://designly.biz"
            target="_blank"
          >Designly 😀</Link></p>
      </footer>
    </div>
  )
}
```

As you can see, our `handleSubmit` function pulls the form data from the state managed by `useForm`. We then call the `validateForm()` function and we abort if validation doesn't pass.

Note: the `disableClientValidation` is only there for demonstration purposes.

---

## Back-End Code

Here's an example of how you can use the same Yup schema to validate on the back-end. I'm using the super-fast Edge runtime in this example. You should consider using Edge for most back-end handlers unless you absolutely can't live without Node.

Note: you can use the toggle on the demo page to bypass front-end validation to test this.

```ts
import formSchema from "@/schema/formSchema";
import *  as Yup from "yup";

// Use Next.js edge runtime
export const config = {
    runtime: 'edge',
}

/**
 * Form handler with Yup schema validation
 * 
 * @author Jay Simons
 */
export default async function handler(request: Request) {
    try {
        const formData = await request.json();

        // Vaidate form data
        try {
            await formSchema.validate(formData, { abortEarly: false });
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                // Retrieve the first validation error and its associated form field
                const errField = err?.inner[0]?.path || '' as string;
                const errMess = err.errors[0];

                throw new Error(JSON.stringify({ errField, errMess }));
            }
        }

        return new Response(JSON.stringify(formData), {
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } catch (err) {
        if (err instanceof Error) {
            return new Response(err.message, { status: 500 });
        }
    }
}
```

---

## Links

1. [GitHub Repo](https://github.com/designly1/next-hook-form-example)
2. [Demo Page](https://next-hook-form-example.pages.dev/)

---

Thank you for taking the time to read my article and I hope you found it useful (or at the very least, mildly entertaining). For more great information about web dev, systems administration and cloud computing, please read the [Designly Blog](https://designly.biz/blog). Also, please leave your comments! I love to hear thoughts from my readers.

I use [Hostinger](https://hostinger.com?REFERRALCODE=1J11864) to host my clients' websites. You can get a business account that can host 100 websites at a price of $3.99/mo, which you can lock in for up to 48 months! It's the best deal in town. Services include PHP hosting (with extensions), MySQL, Wordpress and Email services.

Looking for a web developer? I'm available for hire! To inquire, please fill out a [contact form](https://designly.biz/contact).