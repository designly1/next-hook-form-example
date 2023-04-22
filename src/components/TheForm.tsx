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
