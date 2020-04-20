import React from 'react';

class Slide extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let slideStyle = { backgroundImage: `url( ${this.props.background})` };
    return (
        <div
          className="slider__slide"
          data-active={this.props.active}
          style={slideStyle}
        >
          <div className="slider__slide__text">{this.props.text}</div>
        </div>
    );
  }
}

class Slider extends React.Component {
  constructor(props) {
    super(props);
		this.slides = [
			{
				background: "https://www.w3schools.com/w3images/coffee.jpg",
				text: "Coffee"
			},
			{
				background: "https://www.w3schools.com/w3images/workbench.jpg",
				text: "Workbench"
			},
			{
				background: "https://www.w3schools.com/w3images/sound.jpg",
				text: "Sound"
			}
		];

    this.state = { activeSlide: 0 };
  }

  prevSlide() {
    let slide = this.state.activeSlide - 1 < 0
      ? this.slides.length - 1
      : this.state.activeSlide - 1;
    this.setState({
      activeSlide: slide
    });
  }
  nextSlide() {
    let slide = this.state.activeSlide + 1 < this.slides.length
      ? this.state.activeSlide + 1
      : 0;
    this.setState({
      activeSlide: slide
    });
  }
  render() {
    var slides = this.slides;
    return (
      <div className="slider">
				{slides.map((slide, index, array) => {
					return (
						<Slide
							background={slide.background}
							text={slide.text}
							key={index}
							active={index === this.state.activeSlide}
						/>
					);
				})}
        <div className="leftArrow" onClick={this.nextSlide.bind(this)}><i className="fa fa-4x fa-arrow-circle-right"></i></div>
        <div className="rightArrow" onClick={this.prevSlide.bind(this)}> <i className="fa fa-4x fa-arrow-circle-left"></i></div>
      </div>
    );
  }
}
export default Slider;
