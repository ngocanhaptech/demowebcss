document.addEventListener('DOMContentLoaded', () => {
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            // Remove 'active' class from all items
            accordionItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle 'active' class on the clicked item
            item.classList.toggle('active');
        });
    });

    // Optional: Add logic to ensure at least one item is always active
    // This example starts with the second item active (defined in HTML)
});