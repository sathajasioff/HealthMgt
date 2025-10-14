import appointment_img from './appointment_img.png'
import header_img from './header_img.png'
import group_profiles from './group_profiles.png'
import profile_pic from './profile_pic.png'
import contact_image from './contact_image.png'
import about_image from './about_image.png'
import Logo from './Logo.png'
import dropdown_icon from './dropdown_icon.svg'
import menu_icon from './menu_icon.svg'
import cross_icon from './cross_icon.png'
import chats_icon from './chats_icon.svg'
import verified_icon from './verified_icon.svg'
import arrow_icon from './arrow_icon.svg'
import info_icon from './info_icon.svg'
import upload_icon from './upload_icon.png'
import stripe_logo from './stripe_logo.png'
import razorpay_logo from './razorpay_logo.png'
import doc1 from './doc1.png'
import doc2 from './doc2.png'
import doc3 from './doc3.png'
import doc4 from './doc4.png'
import doc5 from './doc5.png'
import doc6 from './doc6.png'
import doc7 from './doc7.png'
import doc8 from './doc8.png'
import doc9 from './doc9.png'
import doc10 from './doc10.png'
import doc11 from './doc11.png'
import doc12 from './doc12.png'
import doc13 from './doc13.png'
import doc14 from './doc14.png'
import doc15 from './doc15.png'
import Dermatologist from './Dermatologist.svg'
import Gastroenterologist from './Gastroenterologist.svg'
import General_physician from './General_physician.svg'
import Gynecologist from './Gynecologist.svg'
import Neurologist from './Neurologist.svg'
import Pediatricians from './Pediatricians.svg'
import doctor from './doctor.png'
import baby from './baby.png'
import examination from './examination.png'
import drugs from './drugs.png'
import nurse from './nurse.png'
import labor from './labor.png'
import stethoscope from './stethoscope.png'
import instrument from './instrument.png'
import LogoWHITE from './LogoWHITE.png'
import credit_cards from './credit_cards.png'

export const assets = {
    appointment_img,
    header_img,
    group_profiles,
    Logo,
    chats_icon,
    verified_icon,
    info_icon,
    profile_pic,
    arrow_icon,
    contact_image,
    LogoWHITE,
    about_image,
    menu_icon,
    cross_icon,
    dropdown_icon,
    upload_icon,
    stripe_logo,
    razorpay_logo,
    doctor,
    nurse,
    baby,
    instrument,
    labor,
    credit_cards,
    examination,
    drugs,
    stethoscope,
}

export const specialityData = [
    {
        speciality: 'General physician',
        image: General_physician
    },
    {
        speciality: 'Gynecologist',
        image: Gynecologist
    },
    {
        speciality: 'Dermatologist',
        image: Dermatologist
    },
    {
        speciality: 'Pediatricians',
        image: Pediatricians
    },
    {
        speciality: 'Neurologist',
        image: Neurologist
    },
    {
        speciality: 'Gastroenterologist',
        image: Gastroenterologist
    },
]

export const doctors = [
    {
        _id: 'doc1',
        name: 'Dr. Richard James',
        image: doc1,
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        rating: 4.8,
        address: {
            line1: '17th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc2',
        name: 'Dr. Emily Larson',
        image: doc2,
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 60,
        rating: 4.5,
        address: {
            line1: '27th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc3',
        name: 'Dr. Sarah Patel',
        image: doc3,
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 30,
        rating: 4.7,
        address: {
            line1: '37th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc4',
        name: 'Dr. Christopher Lee',
        image: doc4,
        speciality: 'Pediatricians',
        degree: 'MBBS',
        experience: '2 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 40,
        rating: 4.6,
        address: {
            line1: '47th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc5',
        name: 'Dr. Jennifer Garcia',
        image: doc5,
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        rating: 4.9,
        address: {
            line1: '57th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc6',
        name: 'Dr. Andrew Williams',
        image: doc6,
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        rating: 4.8,
        address: {
            line1: '57th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc7',
        name: 'Dr. Christopher Davis',
        image: doc7,
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        rating: 4.7,
        address: {
            line1: '17th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc8',
        name: 'Dr. Timothy White',
        image: doc8,
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 60,
        rating: 4.6,
        address: {
            line1: '27th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc9',
        name: 'Dr. Ava Mitchell',
        image: doc9,
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 30,
        rating: 4.8,
        address: {
            line1: '37th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc10',
        name: 'Dr. Jeffrey King',
        image: doc10,
        speciality: 'Pediatricians',
        degree: 'MBBS',
        experience: '2 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 40,
        rating: 4.5,
        address: {
            line1: '47th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc11',
        name: 'Dr. Zoe Kelly',
        image: doc11,
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        rating: 4.9,
        address: {
            line1: '57th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc12',
        name: 'Dr. Patrick Harris',
        image: doc12,
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        rating: 4.7,
        address: {
            line1: '57th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc13',
        name: 'Dr. Chloe Evans',
        image: doc13,
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        rating: 4.8,
        address: {
            line1: '17th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc14',
        name: 'Dr. Ryan Martinez',
        image: doc14,
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 60,
        rating: 4.6,
        address: {
            line1: '27th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc15',
        name: 'Dr. Amelia Hill',
        image: doc15,
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 30,
        rating: 4.7,
        address: {
            line1: '37th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
]

export const healthcareStats = [
    { title: 'Doctors', count: '42 Doctors', available: '38 Available', color: 'bg-blue-50', icon: doctor },
    { title: 'Nurses', count: '85 Nurses', available: '72 On Duty', color: 'bg-green-50', icon: nurse },
    { title: 'Patients', count: '156 Patients', available: '24 Critical', color: 'bg-red-50', icon: examination },
    { title: 'Pharmacists', count: '18 Pharmacists', available: '15 Active', color: 'bg-purple-50', icon: drugs },
    { title: 'Laboratory', count: '32 Tests Today', available: '8 Pending', color: 'bg-orange-50', icon: labor },
    { title: 'Appointments', count: '64 Today', available: '12 Upcoming', color: 'bg-cyan-50', icon: credit_cards },
    { title: 'Surgeries', count: '8 Cases', available: '3 Critical', color: 'bg-red-100', icon: instrument },
    { title: 'Birth Report', count: '24 Beds', available: '6 Available', color: 'bg-yellow-50', icon: baby },
    { title: 'My Check-up', count: '12 Today', available: '4 Ongoing', color: 'bg-indigo-50', icon: stethoscope },
]

export const appointmentsData = [
    { 
        name: 'Dr. Sarah Johnson', 
        specialization: 'Cardiologist', 
        time: '09:00 AM', 
        patient: 'Robert Chen',
        status: 'Confirmed', 
        statusColor: 'bg-primary',
        type: 'Follow-up'
    },
    { 
        name: 'Dr. Michael Brown', 
        specialization: 'Neurologist', 
        time: '10:30 AM', 
        patient: 'Emma Wilson',
        status: 'In Progress', 
        statusColor: 'bg-blue-500',
        type: 'Consultation'
    },
    { 
        name: 'Dr. Emily Davis', 
        specialization: 'Pediatrician', 
        time: '11:15 AM', 
        patient: 'Baby Lucas',
        status: 'Waiting', 
        statusColor: 'bg-yellow-500',
        type: 'Vaccination',
       
    },
    { 
        name: 'Dr. James Wilson', 
        specialization: 'Orthopedic', 
        time: '02:00 PM', 
        patient: 'David Miller',
        status: 'Confirmed', 
        statusColor: 'bg-primary',
        type: 'Surgery Follow-up'
    },
    { 
        name: 'Dr. Lisa Garcia', 
        specialization: 'Dermatologist', 
        time: '03:30 PM', 
        patient: 'Sophia Martinez',
        status: 'Cancelled', 
        statusColor: 'bg-red-500',
        type: 'Consultation'
    },
    { 
        name: 'Dr. Kevin Lee', 
        specialization: 'Ophthalmologist', 
        time: '04:45 PM', 
        patient: 'Thomas Brown',
        status: 'Confirmed', 
        statusColor: 'bg-green-500',
        type: 'Eye Check-up'
    },
    { 
        name: 'Dr. Amanda White', 
        specialization: 'Gynecologist', 
        time: '09:30 AM', 
        patient: 'Jennifer Clark',
        status: 'Completed', 
        statusColor: 'bg-gray-500',
        type: 'Regular Check-up'
    },
    { 
        name: 'Dr. Richard Scott', 
        specialization: 'Dentist', 
        time: '01:00 PM', 
        patient: 'Brian Taylor',
        status: 'Confirmed', 
        statusColor: 'bg-green-500',
        type: 'Dental Cleaning'
    },
]

export const quickStats = [
    { title: 'Total Patients Today', value: '156', change: '+12%', trend: 'up', color: 'bg-blue-500' },
    { title: 'Available Beds', value: '24', change: '+2', trend: 'up', color: 'bg-green-500' },
    { title: 'Emergency Cases', value: '8', change: '-3%', trend: 'down', color: 'bg-red-500' },
    { title: 'Appointments', value: '64', change: '+8%', trend: 'up', color: 'bg-purple-500' },
]

export const products = [
    {
        id: 1,
        name: 'Diabetasol Sweetener 50 S',
        price: 635.00,
        image: '/src/assets/1.png',
        discount: null,
        category: 'medicine'
    },
    {
        id: 2,
        name: 'Wheelchair - Lb 809',
        price: 27150.00,
        originalPrice: 29750.00,
        image: '/src/assets/2.png',
        discount: '-9%',
        category: 'product'
    },
    {
        id: 3,
        name: 'Teen Derm K Cream 30Ml',
        price: 3293.74,
        image: '/src/assets/3.JPG',
        discount: null,
        category: 'medicine'
    },
    {
        id: 4,
        name: 'Vitamin C 500Mg - Xon Ce',
        price: 26.77,
        image: '/src/assets/4.png',
        discount: null,
        category: 'medicine'
    },
    {
        id: 5,
        name: 'Brands Essnce Of Chicken 42G',
        price: 980.00,
        image: '/src/assets/5.png',
        discount: null,
        category: 'medicine'
    },
    {
        id: 6,
        name: 'Pill Box (Colour)',
        price: 545.00,
        image: '/src/assets/6.JPG',
        discount: null,
        category: 'product'
    },
    
]