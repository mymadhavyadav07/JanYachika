import React from 'react';
import styled from 'styled-components';

const Pattern = () => {
  return (
    <StyledWrapper>
      <div className="circuit-wrapper">
        <div className="circuit-background" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .circuit-wrapper {
    min-height: 100%;
    width: 100%;
    position: relative;
    background-color: white;
  }

  .circuit-background {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 0;
    pointer-events: none;
    background-image: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 19px,
        rgba(75, 85, 99, 0.08) 19px,
        rgba(75, 85, 99, 0.08) 20px,
        transparent 20px,
        transparent 39px,
        rgba(75, 85, 99, 0.08) 39px,
        rgba(75, 85, 99, 0.08) 40px
      ),
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 19px,
        rgba(75, 85, 99, 0.08) 19px,
        rgba(75, 85, 99, 0.08) 20px,
        transparent 20px,
        transparent 39px,
        rgba(75, 85, 99, 0.08) 39px,
        rgba(75, 85, 99, 0.08) 40px
      ),
      radial-gradient(
        circle at 20px 20px,
        rgba(55, 65, 81, 0.12) 2px,
        transparent 2px
      ),
      radial-gradient(
        circle at 40px 40px,
        rgba(55, 65, 81, 0.12) 2px,
        transparent 2px
      );
    background-size:
      40px 40px,
      40px 40px,
      40px 40px,
      40px 40px;
  }`;

export default Pattern;
