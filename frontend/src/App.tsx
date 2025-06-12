import React, {FormEvent, useCallback} from 'react';

function App() {

    const onSubmit = useCallback(async (event:FormEvent<HTMLFormElement>)=>{
        event.preventDefault(); // Prevents the default form submission
        // if (!validateForm()) return false;

        const formData = new FormData(event.currentTarget);

        console.log(event);
        console.log(formData);

        try {
            const res = await fetch('http://localhost:8000/applications', {
                method: 'POST',
                body: formData,
            });
            console.log('Submitted form:', res);
            window.location.href = '/applications';
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting the form.');
        }
        return false;
    },[])



    return (
        <div className="container mt-5">
            <div className="jumbotron">
                <h1 className="display-4">Welcome to the Nursing Program Application Tracker</h1>
                <p className="lead">Apply for our nursing program and track your application status.</p>
                <hr className="my-4"/>
                <p>Fill out the form below to submit your application.</p>
            </div>

            <div className="form-container">
                <h2>Application Form</h2>
                <form id="applicationForm" method="POST" onSubmit={onSubmit}>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <input type="text" className="form-control" id="name" name="name" required/>
                        <div id="nameError" className="error"></div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input type="email" className="form-control" id="email" name="email" required/>
                        <div id="emailError" className="error"></div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="phone" className="form-label">Phone Number</label>
                        <input type="tel" className="form-control" id="phone" name="phone" required/>
                        <div id="phoneError" className="error"></div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="gpa" className="form-label">GPA</label>
                        <input type="number" className="form-control" id="gpa" name="gpa" step="0.1" min="0" max="4"
                               required/>
                        <div id="gpaError" className="error"></div>
                    </div>
                    <button type="submit" className="btn btn-primary">Submit Application</button>
                </form>
            </div>
        </div>
    );
}

export default App;