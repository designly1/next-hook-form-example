/**
 * useForm is a custom hook to manage form state, validation, and submission.
 * @author Jay Simons
 *
 */
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { scroller } from 'react-scroll';
import * as Yup from 'yup';

type FormProps<T> = {
	FormComponent: React.FC<any>;
	I_FormComponentProps?: I_FormComponentProps<T>;
	initialFormData: T;
	schema: Yup.Schema;
	handleSubmit: (e: FormEvent) => Promise<void>;
	isLoading: boolean;
};

export type I_FormComponentProps<T> = {
	formData: T;
	handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
	handleCheckboxChange: (event: ChangeEvent<HTMLInputElement>) => void;
	handleSelectChange: (event: ChangeEvent<HTMLSelectElement>) => void;
	handleMultiSelectChange: (event: ChangeEvent<HTMLSelectElement>) => void;
	errors: { [key: string]: string };
	handleSubmit: (e: FormEvent) => Promise<void>;
};

export default function useForm<T>(props: FormProps<T>) {
	const { FormComponent, I_FormComponentProps, initialFormData, schema, handleSubmit, isLoading } = props;

	// Initialize errors object with empty string values for each form field
	const initialErrors: { [key: string]: string } = {};
	for (const k in initialFormData) {
		initialErrors[k] = '';
	}

	// Set up state variables for formData and errors
	const [formData, setFormData] = useState<T>(initialFormData);
	const [errors, setErrors] = useState<{ [key: string]: string }>(initialErrors);

	// Handle input change events for the form fields
	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		const { name, value } = event.target;
		setFormData(prevState => ({ ...prevState, [name]: value }));
	}

	// Handle checkbox change events for the form fields
	function handleCheckboxChange(event: ChangeEvent<HTMLInputElement>) {
		const { name, checked } = event.target;
		setFormData(prevState => ({ ...prevState, [name]: checked }));
	}

	// Handle select change events for the form fields
	function handleSelectChange(event: ChangeEvent<HTMLSelectElement>) {
		const { name, value } = event.target;
		console.log(name, value);
		setFormData(prevState => ({ ...prevState, [name]: value }));
	}

	// Handle multi-select change events for the form fields
	function handleMultiSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
		const { name, options } = event.target;
		const selectedValues = Array.from(options) // Convert HTMLOptionsCollection to array
			.filter(option => option.selected) // Filter to only selected options
			.map(option => option.value); // Map to their values

		setFormData(prevState => {
			const formKey = name as keyof typeof prevState;
			const existingValues = prevState[formKey] as string[];

			// Determine the new set of values by adding or removing the selected option
			const newValues = selectedValues.reduce(
				(currentValues, value) => {
					// Check if the value is already in the existingValues
					const index = currentValues.indexOf(value);
					if (index > -1) {
						// If the value is already there, remove it (toggle off)
						currentValues.splice(index, 1);
					} else {
						// If the value is not there, add it (toggle on)
						currentValues.push(value);
					}
					return currentValues;
				},
				[...existingValues],
			); // Start with a copy of existing values

			return {
				...prevState,
				[formKey]: newValues,
			};
		});
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
				let errField = err?.inner[0]?.path || ('' as string);
				const errMess = err.errors[0];

				// If the error field is an array element, extract the array name
				const arrMatch = errField.match(/(\w+)\[(\d+)\]/);
				if (arrMatch) {
					errField = arrMatch[1];
				}

				// Scroll to the form field and display the validation error message
				scroller.scrollTo(errField, {
					duration: 700,
					delay: 100,
					smooth: true,
					offset: -50,
				});
				// Log the error to the console and update the errors object
				console.error(errField, errMess);
				setErrors(oldData => ({
					...oldData,
					[errField]: errMess,
				}));
			}
			return false;
		}
	}

	function getFormData(): T {
		return formData;
	}

	function resetForm() {
		setFormData(initialFormData);
		setErrors(initialErrors);
	}

	const assignProps: I_FormComponentProps<T> = {
		formData,
		handleInputChange,
		handleCheckboxChange,
		handleSelectChange,
		handleMultiSelectChange,
		errors,
		handleSubmit,
	};

	function render() {
		return (
			<div className={`w-full relative ${isLoading ? 'opacity-60' : ''}`}>
				{isLoading ? (
					/* Cover the screen to prevent actions while loading */
					<div className="absolute top-0 right-0 bottom-0 left-0 z-10 bg-black/20"></div>
				) : (
					<></>
				)}
				<FormComponent {...assignProps} {...I_FormComponentProps} />
			</div>
		);
	}

	return {
		getFormData,
		setFormData,
		render,
		resetForm,
		validateForm,
	};
}
