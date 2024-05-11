import React, { FormEvent, ChangeEvent } from 'react';
import { Element } from 'react-scroll';
import InputMask from 'react-input-mask';
import Switch from './UI/Switch';

import { I_FormData, E_FavTeams } from '@/interfaces/FormData';
import { I_FormComponentProps } from '@/hooks/useForm';

interface I_TheFormProps extends I_FormComponentProps<I_FormData> {}

export default function TheForm({
	formData,
	handleInputChange,
	handleCheckboxChange,
	handleMultiSelectChange,
	handleSubmit,
	errors,
}: I_TheFormProps) {
	const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		const formattedValue = value.replace(/[^\d]/g, '').substring(0, 10);
		handleInputChange(event);
		event.target.value = formattedValue;
	};

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
				<Element name="favTeams" className="col-span-2">
					<label htmlFor="fav-teams" className="">
						Favorite Teams (select 1 to 3)
					</label>
					<select
						id="fav-teams"
						className="input-base"
						name="favTeams"
						onChange={handleMultiSelectChange}
						multiple
						value={formData.favTeams}
					>
						{Object.keys(E_FavTeams).map(team => {
							const teamKey = team as keyof typeof E_FavTeams;
							return (
								<option key={team} value={team}>
									{E_FavTeams[teamKey]}
								</option>
							);
						})}
					</select>
					{errors.favTeams && <p className="text-red-500">{errors.favTeams}</p>}
				</Element>
				<Element name="acceptTerms">
					<Switch
						name="acceptTerms"
						onChange={handleCheckboxChange}
						checked={formData.acceptTerms}
						label="Accept Terms and Conditions"
					/>
					{errors.acceptTerms && <p className="text-red-500">{errors.acceptTerms}</p>}
				</Element>
			</div>
		</form>
	);
}
