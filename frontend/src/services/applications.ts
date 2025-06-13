export const postApplication = async (formData: FormData) => {
    try {
        const res = await fetch('http://localhost:8000/applications', {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) {
            throw new Error('Error submitting form')
        }
        console.log('Submitted form:', res);
        return;
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('There was an error submitting the form.');
    }
}