document.querySelectorAll('.embla').forEach((emblaNode) => {

    const viewport = emblaNode.querySelector('.embla__viewport');

    const autoplay = EmblaCarouselAutoplay({
        delay: 2000,
        stopOnInteraction: false,
        stopOnMouseEnter: true
    });

    const embla = EmblaCarousel(
        viewport,
        {
            loop: true,
            align: 'center'
        },
        [autoplay]
    );

    emblaNode
        .querySelector('.embla__prev')
        .addEventListener('click', () => embla.scrollPrev());

    emblaNode
        .querySelector('.embla__next')
        .addEventListener('click', () => embla.scrollNext());

});
