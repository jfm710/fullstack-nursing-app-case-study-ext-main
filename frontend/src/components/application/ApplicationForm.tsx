import React, {FormEvent, useCallback, useRef, useState} from "react";
import {postApplication} from "../../services/applications";
import {EMAIL_PATTERN, PHONE_PATTERN} from "../../utils/utils";

function ApplicationForm() {
    // These are for only reading from an uncontrolled input
    const nameField: React.RefObject<null | HTMLInputElement> = useRef(null);
    const emailField: React.RefObject<null | HTMLInputElement> = useRef(null);
    const phoneField: React.RefObject<null | HTMLInputElement> = useRef(null);
    const gpaField: React.RefObject<null | HTMLInputElement> = useRef(null);
    const workLocationField: React.RefObject<null | HTMLInputElement> = useRef(null);
    const passedNCLEXField: React.RefObject<null | HTMLInputElement> = useRef(null);
    const nclexLocationField: React.RefObject<null | HTMLInputElement> = useRef(null);

    const [enableNCLEXLocation, setEnableNCLEXLocation] = useState(false);

    const passedNCLEX = useCallback(() => {
        setEnableNCLEXLocation(!!passedNCLEXField.current?.checked);
    }, [passedNCLEXField])

    const [nameValid, setNameValid] = useState(true);
    const [emailValid, setEmailValid] = useState(true);
    const [phoneValid, setPhoneValid] = useState(true);
    const [gpaValid, setGPAValid] = useState(true);

    //Validating in callback so it is not showing up as an error as user types
    const validateForm = useCallback((): boolean => {
        // Name validation
        const nameTest = nameField.current?.value !== '';
        setNameValid(nameTest)

        // Email validation
        const emailTest = EMAIL_PATTERN.test(emailField.current?.value as string);
        setEmailValid(emailTest)

        // Phone validation
        const phoneTest = PHONE_PATTERN.test(phoneField.current?.value as string);
        setPhoneValid(phoneTest)

        // GPA validation
        const gpaFloat = parseFloat(gpaField.current?.value as string);
        const gpaTest = !isNaN(gpaFloat) && gpaFloat >= 0 && gpaFloat <= 4
        setGPAValid(gpaTest)

        return nameTest && emailTest && phoneTest && gpaTest;
    }, [nameField, emailField, phoneField, gpaField])

    const onSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevents the default form submission
        if (!validateForm()) return false;

        const formData = new FormData(event.currentTarget);
        postApplication(formData).then((res) => {
            if (res?.ok) {
                //TODO: Replace with a router
                //navigate({to: '/applications', replace: false})
                window.location.href = '/applications';
            }
        })
        return false;
    }, [validateForm])

    return (
        <div className="form-container">
            <h2>Application Form</h2>
            <form id="applicationForm" method="POST" onSubmit={onSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input ref={nameField} type="text" className="form-control" id="name" name="name" required/>
                    {nameValid ? null : <div id="nameError" className="error">Name is required</div>}
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input ref={emailField} type="email" className="form-control" id="email" name="email" required/>
                    {emailValid ? null : <div id="emailError" className="error">Invalid email address</div>}
                </div>
                <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input ref={phoneField} type="tel" className="form-control" id="phone" name="phone" required/>
                    {phoneValid ? null :
                        <div id="phoneError" className="error">Invalid phone number (10 digits required)</div>}
                </div>
                <div className="mb-3">
                    <label htmlFor="gpa" className="form-label">GPA</label>
                    <input ref={gpaField} type="number" className="form-control" id="gpa" name="gpa" step="0.1" min="0"
                           max="4" required/>
                    {gpaValid ? null : <div id="gpaError" className="error">GPA must be between 0 and 4</div>}
                </div>
                <div className="mb-3">
                    <label htmlFor="work_location" className="form-label">Which locations are you willing to work
                        in?</label>
                    <input ref={workLocationField} type="text" className="form-control" id="work_location"
                           name="work_location"/>
                </div>
                <div className="mb-3 form-check">
                    <input ref={passedNCLEXField} type="checkbox" className="form-check-input" id="passed_nclex"
                           name="passed_nclex" onChange={passedNCLEX}/>
                    <label htmlFor="passed_nclex" className="form-check-label">Have you passed the NCLEX?</label>
                </div>
                <div className="mb-3">
                    <label htmlFor="nclex_state" className="form-label">Which state did you pass the NCLEX?</label>
                    <input disabled={!enableNCLEXLocation} ref={nclexLocationField} type="text" className="form-control"
                           id="nclex_state" name="nclex_state"/>
                </div>
                <button type="submit" className="btn btn-primary">Submit Application</button>
            </form>
        </div>
    )
}

export default ApplicationForm;