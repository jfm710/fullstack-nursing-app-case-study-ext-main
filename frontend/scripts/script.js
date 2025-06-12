// Function to fetch applications data and render the list
function loadApplications() {
    // Fetch data from the backend API
    fetch('http://localhost:8000/applications')
        .then(response => response.json())
        .then(applications => {
            const listElement = document.getElementById('application-list');
            
            // Clear any existing content
            listElement.innerHTML = '';

            // Loop through the applications and create list items
            applications.forEach(app => {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item';
                listItem.innerHTML = `
                    <strong>${app.name}</strong> - 
                    Email: ${app.email}, 
                    Phone: ${app.phone}, 
                    GPA: ${app.gpa}, 
                    Submitted: ${app.submitted_at}
                `;
                listElement.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Error fetching applications:', error);
        });
}

// Form validation
function validateForm() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const gpa = document.getElementById('gpa').value;

    let isValid = true;

    // Name validation
    if (name.trim() === '') {
        document.getElementById('nameError').textContent = 'Name is required';
        isValid = false;
    } else {
        document.getElementById('nameError').textContent = '';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('emailError').textContent = 'Invalid email address';
        isValid = false;
    } else {
        document.getElementById('emailError').textContent = '';
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        document.getElementById('phoneError').textContent = 'Invalid phone number (10 digits required)';
        isValid = false;
    } else {
        document.getElementById('phoneError').textContent = '';
    }

    // GPA validation
    const gpaFloat = parseFloat(gpa);
    if (isNaN(gpaFloat) || gpaFloat < 0 || gpaFloat > 4) {
        document.getElementById('gpaError').textContent = 'GPA must be between 0 and 4';
        isValid = false;
    } else {
        document.getElementById('gpaError').textContent = '';
    }

    return isValid;
}



async function editApplicationForm(event) {
    event.preventDefault(); // Prevents the default form submission
    if (!validateForm()) return false;

    const form = document.getElementById('editForm');
    const formData = new FormData(form);
    const id = formData.get('id');

    try {
        const res = await fetch(`http://localhost:8000/admin/edit/${id}`, {
            method: 'POST',
            body: formData,
        });
        console.log('Submitted form:', res);
        window.location.href = '/admin';
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('There was an error submitting the form.');
    }
    return false;
}


// Function to fetch applications data and render the table
function loadEditableApplications() {
    // Fetch data from the backend API
    fetch('http://localhost:8000/applications')
        .then(response => response.json())
        .then(applications => {
            const tableBody = document.getElementById('edit-app-table');
            
            // Clear any existing content
            tableBody.innerHTML = '';

            // Loop through the applications and create table rows
            applications.forEach(app => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${app.id}</td>
                    <td>${app.name}</td>
                    <td>${app.email}</td>
                    <td>${app.phone}</td>
                    <td>${app.gpa}</td>
                    <td>${app.submitted_at}</td>
                    <td>
                        <a href="/edit_application/${app.id}" class="btn btn-primary">Edit</a>
                        <a href="#" class="btn btn-sm btn-danger" onclick="if (confirm('Are you sure you want to delete this application?')) deleteApplication(${app.id}); return false;">Delete</a>
                    </td>
                `;
                
                // Append the row to the table body
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching applications:', error);
        });
}


// Function to fetch applications data and render the table
function loadEditableApplication() {
    const path = window.location.pathname;
    const id = path.split("/").pop();
    console.log("Application ID:", id);

        // Fetch data from the backend API
        fetch(`http://localhost:8000/admin/edit/${id}`)
        .then(response => response.json())
        .then(application => {
            const data = application.data;
            // Populate form fields with fetched data
            document.getElementById('application-id').value = data.id;
            document.getElementById('name').value = data.name;
            document.getElementById('email').value = data.email;
            document.getElementById('phone').value = data.phone;
            document.getElementById('gpa').value = data.gpa;
        })
        .catch(error => {
            console.error('Error fetching application for edit:', error);
        })

}

// Function to fetch applications data and render the table
function deleteApplication(id) {

    // Delete data from the backend API
    fetch(`http://localhost:8000/admin/delete/${id}`, {
        method: 'POST',
    })
    .then(() => {
        console.log(`Deleted App with ID: ${id}`)
        window.location.href = '/admin';
    })
    .catch(error => {
        console.error('Error delete application for edit:', error);
    })

}
