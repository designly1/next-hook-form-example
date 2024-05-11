import * as yup from 'yup';
import YupPassword from 'yup-password';
YupPassword(yup);

import { E_FavTeams } from '@/interfaces/FormData';

const phoneRegExp = /^(\+0?1\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;
const favTeams = Object.keys(E_FavTeams);

const formSchema = yup.object().shape({
	fullName: yup.string().nullable().label('Full Name').required().min(3).max(40),
	email: yup.string().nullable().label('Email Address').required().email('Invalid Email Address'),
	phone: yup.string().nullable().label('Mobile Phone').required().matches(phoneRegExp, 'Invalid Phone Number'),
	password: yup.string().label('Password').password().required(),
	favTeams: yup.array().label('Favorite Teams').required().min(1).max(3).of(yup.string().oneOf(favTeams, 'Invalid team selected')),
	acceptTerms: yup
		.boolean()
		.label('Accept Terms')
		.required()
		.oneOf([true], 'You must accept the terms and conditions'),
});

export default formSchema;
