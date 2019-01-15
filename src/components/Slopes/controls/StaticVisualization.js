import React from 'react';
import styled from 'styled-components';
import { useSpring, animated } from 'react-spring/hooks';

import { COLORS } from '../../../constants';
import { normalize, clamp } from '../../../utils';
import radarSweep from '../../../images/radar-sweep-2x.png';

import Svg from '../../Svg';
import StaticNoise from './StaticNoise';

const springConfig = {
  tension: 120,
  friction: 7,
};

const StaticVisualization = ({ value, size, isAnimated }) => {
  const rotationOffset = 180;
  const numOfSweeps = 1.5;
  const sweepAngle = normalize(
    value,
    0,
    100,
    rotationOffset * -1,
    rotationOffset * -1 + numOfSweeps * 360 * -1
  );

  const isEnemyVisible = value > 45;

  const noisePadding = 3;

  return (
    <Wrapper>
      <NoiseWrapper style={{ margin: noisePadding }}>
        <StaticNoise size={size - noisePadding * 2} value={value} />
      </NoiseWrapper>
      <Sweep
        src={radarSweep}
        style={{
          width: size,
          height: size,
          transform: `rotate(${sweepAngle}deg)`,
        }}
      />
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <defs>
          <filter
            id="static-viz-filter0"
            x="18.4921"
            y="18.4998"
            width="8.01592"
            height="7.72148"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feOffset dx="0.5" dy="0.5" />
            <feGaussianBlur stdDeviation="0.5" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.14902 0 0 0 0 0.14902 0 0 0 0 0.14902 0 0 0 0.52 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow"
              result="shape"
            />
          </filter>
        </defs>

        <path
          d="M5 16.5238H16M27 16.5238H16M16 16.5238V5M16 16.5238V27"
          stroke="#32FF98"
          strokeOpacity="0.46"
        />
        <circle
          cx="16"
          cy="16"
          r="3.11905"
          stroke="#009E69"
          strokeOpacity="0.5"
        />
        <circle
          cx="16"
          cy="15.9999"
          r="6.2619"
          stroke="#009E69"
          strokeOpacity="0.5"
        />
        <circle
          cx="16"
          cy="16"
          r="9.40476"
          stroke="#009E69"
          strokeOpacity="0.5"
        />
        <g filter="url(#static-viz-filter0)">
          <path
            d="M22 19L22.0018 21.9976L24.8532 21.0729L22.0029 22.0009L23.7634 24.4271L22 22.003L20.2366 24.4271L21.9971 22.0009L19.1468 21.0729L21.9982 21.9976L22 19Z"
            stroke="white"
            style={{ opacity: isEnemyVisible ? 1 : 0 }}
          />
        </g>
      </svg>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
`;

const NoiseWrapper = styled.div`
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const Sweep = styled.img`
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  transform-origin: center center;
`;

export default StaticVisualization;
