// Get the modal and close button
const modal = document.getElementById('projectModal');
const modalContent = document.getElementById('modalContent');

// Add event listeners to all project divs
const projectDivs = document.querySelectorAll('.project-div');
projectDivs.forEach(div => {
div.addEventListener('click', function() {
    const projectNumber = div.getAttribute('data-project'); // Get the project number
  openModal(projectNumber);
});
});

const projects = [
  {
    images: [
    '../img/Designs/Flyer1.jpg',
    '../img/Designs/Flyer2.jpg',
    '../img/Designs/Flyer3.jpg'],
    title: 'Project 1 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 1.</p>`
  },
  {
    images: [
    '../img/Designs/Flyer2.jpg',
    '../img/Designs/Flyer3.jpg',
    '../img/Designs/Flyer4.jpg',
    '../img/Designs/Flyer5.jpg',
    ],
    title: 'Project 2 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 2.</p>`
  },
  {
    images: [
    '../img/Designs/Flyer3.jpg',
    '../img/Designs/Flyer4.jpg',
    '../img/Designs/Flyer5.jpg',
    '../img/Designs/Flyer6.jpg',
    '../img/Designs/Flyer7.jpg',],
    title: 'Project 3 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 3.</p>`
  },
  {
    images: [
    '../img/Designs/Flyer4.jpg',
    '../img/Designs/Flyer5.jpg',
    '../img/Designs/Flyer6.jpg',
    '../img/Designs/Flyer7.jpg',
    '../img/Designs/Flyer8.jpg',
    '../img/Designs/Flyer9.jpg',],
    title: 'Project 4 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 4.</p>`
  },
  {
    images: ['../img/Designs/Flyer5.jpg'],
    title: 'Project 5 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 5.</p>`
  },
  {
    images: ['../img/Designs/Flyer6.jpg'],
    title: 'Project 6 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 6.</p>`
  },
  {
    images: ['../img/Designs/Flyer7.jpg'],
    title: 'Project 7 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 7.</p>`
  },
  {
    images: ['../img/Designs/Flyer8.jpg'],
    title: 'Project 8 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 8.</p>`
  },
  {
    images: ['../img/Designs/Flyer9.jpg'],
    title: 'Project 9 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 9.</p>`
  },
  {
    images: ['../img/Designs/Flyer10.jpg'],
    title: 'Project 10 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 10.</p>`
  },
  {
    images: ['../img/Designs/Flyer11.jpg'],
    title: 'Project 11 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 11.</p>`
  },
  {
    images: ['../img/Designs/Flyer12.jpg'],
    title: 'Project 12 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 12.</p>`
  },
  {
    images: ['../img/Designs/Flyer13.jpg'],
    title: 'Project 13 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 13.</p>`
  },
  {
    images: ['../img/Designs/Flyer14.jpg'],
    title: 'Project 14 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 14.</p>`
  },
  {
    images: ['../img/Designs/Flyer15.jpg'],
    title: 'Project 15 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 15.</p>`
  },
  {
    images: ['../img/Designs/Flyer16.jpg'],
    title: 'Project 16 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 16.</p>`
  },
  {
    images: ['../img/Designs/Flyer17.jpg'],
    title: 'Project 17 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 17.</p>`
  },
  {
    images: ['../img/Designs/Flyer18.jpg'],
    title: 'Project 18 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 18.</p>`
  },
  {
    images: ['../img/Designs/Flyer19.jpg'],
    title: 'Project 19 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 19.</p>`
  },
  {
    images: ['../img/Designs/Flyer20.jpg'],
    title: 'Project 20 Title',
    description: 
    `<p class="project-date">2024.10.24</p>
    <p class="project-details1">This is the second paragraph with more details.</p>
    <p class="project-details2">More information on Project 20.</p>`
  },
  // Add more projects as needed
];

function openModal(projectIndex) {
  const modal = document.getElementById('projectModal');
  modal.style.display = 'flex'; // Show the modal
  setTimeout(() => {
      modal.classList.add('show'); // Add the class to trigger the transition
  }, 10); // Slight delay for the transition

  const project = projects[projectIndex];

  // Set the title and description, allowing multiple <p> tags in the description
  document.getElementById('modalDetails').innerHTML = `
      <h2>${project.title}</h2>
      ${project.description} <!-- No need for <p> inside, it's already in the string -->
  `;

  // Clear existing content in modalImage
  const modalImageContainer = document.getElementById('modalImage');
  modalImageContainer.innerHTML = ''; // Clear previous images

  // Add images to modalImage div
  project.images.forEach(image => {
      const imgElement = document.createElement('img');
      imgElement.src = image;
      imgElement.alt = project.title; // Alt text for accessibility
      imgElement.style.marginBottom = '15px'; // Add spacing between images if needed
      modalImageContainer.appendChild(imgElement);
  });
}

const closeBtn = document.getElementById('closeBtn');
closeBtn.addEventListener('click', () => {
  modal.classList.remove('show');
  setTimeout(() => {
      modal.style.display = 'none';
  }, 500); // Timeout matches the transition time
});

// Close modal if clicked outside the modal content
window.addEventListener('click', function(event) {
if (event.target === modal) {
  modal.classList.remove('show');
  setTimeout(() => {
      modal.style.display = 'none';
  }, 300);
}
});
