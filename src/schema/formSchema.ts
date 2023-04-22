import * as yup from "yup";
import YupPassword from 'yup-password';
YupPassword(yup);

const phoneRegExp = /^(\+0?1\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;

const formSchema = yup.object().shape({
    fullName: yup.string()
        .nullable()
        .label('Full Name')
        .required()
        .min(3)
        .max(40),
    email: yup.string()
        .nullable()
        .label('Email Address')
        .required()
        .email('Invalid Email Address'),
    phone: yup.string()
        .nullable()
        .label('Mobile Phone')
        .required()
        .matches(phoneRegExp, 'Invalid Phone Number'),
    password: yup.string()
        .label('Password')
        .password()
        .required()
});

export default formSchema;