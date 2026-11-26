import Link from "next/link";
import styled from "styled-components";

export default function NotFound() {
  return (
    <StyledWrapper>
      <main className="not-found" aria-labelledby="not-found-title">
        <p className="eyebrow">JOBNEST • 404</p>
        <h1 id="not-found-title">Looks like this page took a detour.</h1>
        <p className="description">
          The page you’re looking for has left the station.
        </p>

        <svg
          className="scene"
          viewBox="0 0 1000 355"
          role="img"
          aria-labelledby="train-title train-description"
        >
          <title id="train-title">A train passing through the countryside</title>
          <desc id="train-description">
            A little train rolls along the tracks beneath drifting clouds.
          </desc>
          <defs>
            <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
              <stop stopColor="#172554" />
              <stop offset="1" stopColor="#256b86" />
            </linearGradient>
            <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
              <stop stopColor="#8bd0d1" />
              <stop offset="1" stopColor="#d8f1dc" />
            </linearGradient>
          </defs>
          <path fill="url(#sky)" d="M0 0h1000v220H0z" />
          <path fill="url(#water)" d="M0 200h1000v155H0z" />
          <path fill="#123d59" d="M0 274c130-40 255-40 385 0 135-40 265-40 400 0 85-24 150-26 215-7v88H0z" />

          <g className="cloud cloud-one" fill="#f3fbff" opacity=".88">
            <ellipse cx="145" cy="74" rx="50" ry="15" />
            <circle cx="125" cy="65" r="20" />
            <circle cx="152" cy="56" r="27" />
            <circle cx="177" cy="67" r="19" />
          </g>
          <g className="cloud cloud-two" fill="#f3fbff" opacity=".75">
            <ellipse cx="790" cy="112" rx="49" ry="14" />
            <circle cx="770" cy="103" r="18" />
            <circle cx="797" cy="95" r="24" />
            <circle cx="821" cy="105" r="17" />
          </g>

          <path className="rail" d="M0 296h1000M0 319h1000" />
          <path className="sleepers" d="M0 292v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31m38-31v31" />

          <g className="train">
            <path
              className="train-body"
              d="M333 251v-51c0-12 8-23 18-31l38-30c10-8 22-12 36-12h34v-12h40v12h335c18 0 31 13 31 30v94H333z"
            />
            <path className="train-window" d="M370 199h62v-54h-8c-10 0-19 4-27 10l-27 23z" />
            <path className="train-window" d="M512 143h94v52h-94zM620 143h94v52h-94zM728 143h94v52h-94z" />
            <path className="train-stripe" d="M333 216h532v17H333z" />
            <text className="train-label" x="380" y="215">404</text>
            <text className="train-label small-label" x="655" y="215">NO SUCH PAGE</text>
            <circle className="wheel" cx="400" cy="268" r="22" />
            <circle className="wheel" cx="464" cy="268" r="22" />
            <circle className="wheel" cx="760" cy="268" r="22" />
            <circle className="wheel" cx="824" cy="268" r="22" />
            <circle className="wheel-center" cx="400" cy="268" r="8" />
            <circle className="wheel-center" cx="464" cy="268" r="8" />
            <circle className="wheel-center" cx="760" cy="268" r="8" />
            <circle className="wheel-center" cx="824" cy="268" r="8" />
          </g>
        </svg>

        <Link className="home-link" href="/">
          Back to JobNest
        </Link>
      </main>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  min-height: calc(100vh - 5rem);
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 2rem 1.25rem;
  color: #f8fafc;
  text-align: center;
  background: radial-gradient(ellipse at 50% 70%, #164e63 0%, #0f172a 68%);

  .not-found {
    width: min(100%, 900px);
  }

  .eyebrow {
    margin: 0 0 0.75rem;
    color: #67e8f9;
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.2em;
  }

  h1 {
    margin: 0;
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    line-height: 1.1;
  }

  .description {
    margin: 1rem 0 0;
    color: #cbd5e1;
    font-size: clamp(1rem, 2vw, 1.15rem);
  }

  .scene {
    display: block;
    width: 100%;
    height: auto;
    margin: 1rem auto 0;
  }

  .cloud {
    animation: drift 32s linear infinite alternate;
  }

  .cloud-two {
    animation-duration: 42s;
    animation-direction: alternate-reverse;
  }

  .rail {
    fill: none;
    stroke: #dbeafe;
    stroke-width: 6;
  }

  .sleepers {
    fill: none;
    stroke: #94a3b8;
    stroke-width: 7;
    stroke-dasharray: 4 34;
    animation: track-roll 5s linear infinite;
  }

  .train {
    animation: train-roll 14s ease-in-out infinite alternate;
  }

  .train-body {
    fill: #f8fafc;
    stroke: #0e7490;
    stroke-width: 5;
    stroke-linejoin: round;
  }

  .train-window {
    fill: #164e63;
    stroke: #67e8f9;
    stroke-width: 4;
  }

  .train-stripe {
    fill: #f97316;
  }

  .train-label {
    fill: #0f172a;
    font: 800 24px system-ui, sans-serif;
  }

  .small-label {
    font-size: 14px;
  }

  .wheel {
    fill: #0f172a;
    stroke: #67e8f9;
    stroke-width: 5;
  }

  .wheel-center {
    fill: #f97316;
  }

  .home-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 3rem;
    margin-top: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    color: #082f49;
    background: #67e8f9;
    font-weight: 800;
    text-decoration: none;
    transition: background 160ms ease, transform 160ms ease;
  }

  .home-link:hover {
    transform: translateY(-2px);
    background: #a5f3fc;
  }

  .home-link:focus-visible {
    outline: 3px solid #fff;
    outline-offset: 4px;
  }

  @keyframes drift {
    to {
      transform: translateX(45px);
    }
  }

  @keyframes train-roll {
    from {
      transform: translateX(-8px);
    }
    to {
      transform: translateX(8px);
    }
  }

  @keyframes track-roll {
    to {
      stroke-dashoffset: -76;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cloud,
    .train,
    .sleepers {
      animation: none;
    }
  }
`;
