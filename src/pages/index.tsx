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
