const toolOptions = document.querySelectorAll('.tool-optn');
const tooltip = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.backgroundColor = 'rgba(35,35,35,0.7)';
tooltip.style.backdropFilter = 'blur(10px)';
tooltip.style.color = 'white';
tooltip.style.padding = '5px 10px';
tooltip.style.borderRadius = '5px';
tooltip.style.borderWidth = '1px';
tooltip.style.borderStyle = 'solid';
tooltip.style.borderColor = 'rgba(255,255,255,0.1)';
tooltip.style.fontSize = '12px';
tooltip.style.pointerEvents = 'none';
tooltip.style.display = 'none';
tooltip.style.zIndex = '1000';
document.body.appendChild(tooltip);

toolOptions.forEach(option => {
    option.addEventListener('mouseenter', (e) => {
        const toolName = option.getAttribute('data-tooltip');
        if (toolName) {
            tooltip.textContent = toolName;
            const rect = option.getBoundingClientRect();
            tooltip.style.left = `${rect.left}px`;
            tooltip.style.top = `${rect.top - 40}px`;
            tooltip.style.display = 'block';
        }
    });

    option.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });
});
