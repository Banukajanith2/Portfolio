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
    'img/Designs2/project1/1.jpg',
    'img/Designs2/project1/2.jpg',],
    title: 'Zombie Apocalypse - Manipulation',
    description: 
    `<p class="project-date">2017.05.13</p>
    <p class="project-details1">This is a Photo Manipulation using Photoshop.</p>
    <p class="project-details2">
    Using a personal photo, combined with sourced backgrounds and zombie images, I applied advanced photo manipulation techniques to blend elements seamlessly. 
    With focused lighting, color grading, and atmospheric effects, I crafted a realistic, immersive apocalyptic setting.</p>`
  },
  {
    images: [
    'img/Designs2/project2/1.jpg',
    'img/Designs2/project2/2.jpg',],
    title: 'Sleeping Beast - Manipulation',
    description: 
    `<p class="project-date">2017.05.18</p>
    <p class="project-details1">In this Photoshop project, I crafted a magical, dreamy scene of a large wolf sleeping beside a young girl.</p>
    <p class="project-details2">Using images sourced online, I combined elements through meticulous photo manipulation, adding soft lighting, color grading, and atmospheric effects to create a serene, enchanting night setting with a sense of warmth and wonder.</p>`
  },
  {
    images: [
    'img/Designs2/project3/1.jpg',],
    title: 'Bed Heads Flyer - Ranga Industries',
    description: 
    `<p class="project-date">2018.02.24</p>
    <p class="project-details1">I designed a clean, eye-catching flyer in Photoshop and InDesign for a friend’s family business, Ranga Industried specializing in bed head repair and installation services.</p>
    <p class="project-details2"></p>`
  },
  {
    images: [
    'img/Designs2/project4/1.jpg',],
    title: 'P.N.P Bakery - Flyer Design',
    description: 
    `<p class="project-date">2018.04.11</p>
    <p class="project-details1">I created a modern, sleek flyer for P.N.P Bakery, highlighting the deliciousness of their offerings through an elegant design that captures their food's tastefulness.</p>
    <p class="project-details2"></p>`
  },
  {
    images: ['img/Designs2/project5/Flyer2.jpg',
      'img/Designs2/project5/LuckyRefBusinessCard.jpg',
    ],
    title: 'Lucky Ref - Flyer & Business Card Design',
    description: 
    `<p class="project-date">2018.09.25</p>
    <p class="project-details1">I designed two minimalistic flyers and a business card for my father's company, Lucky Ref. Cool Engineers, showcasing their installation, repair, and maintenance services for whatsapp sharing.</p>
    <p class="project-details2"></p>`
  },
  {
    images: ['img/Designs2/project6/1.png',
      'img/Designs2/project6/2.png'
    ],
    title: 'Lucky Ref - Logo Design',
    description: 
    `<p class="project-date">2019.03.05</p>
    <p class="project-details1">This is two logo designs for the Lucky Ref. Cool Engineers using Photoshop.</p>
    <p class="project-details2"></p>`
  },
  {
    images: ['img/Designs2/project7/1.jpg'],
    title: 'Art Classes - Flyer Design',
    description: 
    `<p class="project-date">2019.06.20</p>
    <p class="project-details1">This is a flyer design i created for a friend with the theme of arts and crafts.</p>
    <p class="project-details2">The theme is focused on main details with the eye-catching artistic backgrounds and elements.</p>`
  },
  {
    images: ['img/Designs2/project8/1.JPG',
      'img/Designs2/project8/2.JPG'
    ],
    title: 'Personal Training - Flyer Design',
    description: 
    `<p class="project-date">2019.07.02</p>
    <p class="project-details1">This is a professional flyer for a friend’s one-on-one personal training services, tailored for social media, with essential customer information in a clear, engaging layout.</p>
    <p class="project-details2"></p>`
  },
  {
    images: ['img/Designs2/project9/1.jpg'],
    title: 'Carrom Class - Flyer',
    description: 
    `<p class="project-date">2019.10.10</p>
    <p class="project-details1">I designed this eye-catching, smooth flyer in Photoshop for a carrom class, optimized for sharing.</p>
    <p class="project-details2">It features a clean layout to attract and inform potential participants effectively.</p>`
  },
  {
    images: ['img/Designs2/project10/1.jpg'],
    title: 'Cake Class - Flyer Design',
    description: 
    `<p class="project-date">2020.03.18</p>
    <p class="project-details1">I designed this flyer in Photoshop for a cake baking class, using selected photos and fonts from Google.</p>
    <p class="project-details2"> The layout is attractive, engaging, and captures attention effectively.</p>`
  },
  {
    images: ['img/Designs2/project11/1.jpg'],
    title: 'Speech Therapy - Flyer Design',
    description: 
    `<p class="project-date">2020.06.13</p>
    <p class="project-details1">I created this flyer for a friend’s private language and speech therapy practice, designed for children and the elderly. The layout is simple, with a thoughtfully chosen background that enhances readability and warmth.</p>
    <p class="project-details2"></p>`
  },
  {
    images: ['img/Designs2/project12/1.jpg'],
    title: 'Music Class - Flyer Design',
    description: 
    `<p class="project-date">2020.11.19</p>
    <p class="project-details1">I designed this flyer for my mothers violin classes, featuring an eye-catching layout with a violin-themed background to enhance appeal and capture attention effectively. The design highlights essential class details.</p>
    <p class="project-details2"></p>`
  },
  {
    images: ['img/Designs2/project13/1.jpg',
      'img/Designs2/project13/2.jpg',
      'img/Designs2/project13/3.jpg',
      'img/Designs2/project13/4.jpg',
      'img/Designs2/project13/5.jpg'
    ],
    title: 'Helmet Shop - Flyer Design',
    description: 
    `<p class="project-date">2024.05.10</p>
    <p class="project-details1">I designed this flyer for a helmet shop, showcasing five new helmet designs with color options and pricing. Important details are presented clearly, making the flyer both informative and visually engaging.</p>
    <p class="project-details2"></p>`
  },
  {
    images: ['img/Designs2/project14/1.jpg'],
    title: 'Halloween Party - Flyer Design',
    description: 
    `<p class="project-date">2022.10.02</p>
    <p class="project-details1">This is a Halloween party flyer designed collaboratively with a friend for the Rotaract Club in Saegis Campus. The design is simple yet captures spooky Halloween vibes, setting the tone for a thrilling event.</p>
    <p class="project-details2"></p>`
  },
  {
    images: ['img/Designs2/project15/1.JPG'],
    title: 'Game Tournament - Flyer Design',
    description: 
    `<p class="project-date">2022.12.05</p>
    <p class="project-details1">
I collaborated with a friend to design this flyer for a game tournament at Saegis Campus organized by the ICT Club. The layout is simple yet modern, capturing interest with a sleek, engaging look.</p>
    <p class="project-details2"></p>`
  },
  {
    images: ['img/Designs2/project16/1.jpg'],
    title: 'AIESEC - Poster Design',
    description: 
    `<p class="project-date">2023.05.14</p>
    <p class="project-details1">This is the first poster i designed when i was in AIESEC DXP(Digital Experience) team.</p>
    <p class="project-details2"></p>`
  },
  {
    images: ['img/Designs2/project17/1.JPG',
      'img/Designs2/project17/2.JPG',
      'img/Designs2/project17/3.JPG'
    ],
    title: 'AIESEC Global Talent - Flyer Design',
    description: 
    `<p class="project-date">2023.09.28</p>
    <p class="project-details1">These flyer designs were created in collaboration with my DXP team leader at AIESEC for social media sharing. They focus on the Ongoing Global Talent (OGT) initiatives within our club, aiming to engage members with valuable information.</p>
    <p class="project-details2">Each flyer highlights exclusive job opportunities abroad for AIESEC members. The designs are crafted to effectively communicate these benefits, encouraging participation and interest in global experiences.</p>`
  },
  {
    images: ['img/Designs2/project18/1.jpg'],
    title: 'AIESEC BLITZ - Poster Design',
    description: 
    `<p class="project-date">2024.01.16</p>
    <p class="project-details1">This is a poster design I created for AIESEC, promoting an event called BLITS, a Micro-Mouse tournament. We designed these posters in advance to generate excitement and introduce the event prior to its official announcement.</p>
    <p class="project-details2"></p>`
  },

  {
    images: ['img/Designs2/project5/Flyer1.jpg',],
    title: 'Lucky Ref - Flyer Design',
    description: 
    `<p class="project-date">2024.09.01</p>
    <p class="project-details1">I designed this new flyer my father's company, Lucky Ref. Cool Engineers, showcasing their installation, repair, and maintenance services for social media promotion.</p>
    <p class="project-details2"></p>`
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
