import { STATUS, avatarCells } from '../data/social';

export default function PixelAvatar({ person, size = 44, status }) {
  const cells = avatarCells(person.name);
  return (
    <span className="pavatar" style={{ '--c': person.color, width: size, height: size }}>
      <svg viewBox="-1 -1 7 7" shapeRendering="crispEdges" aria-hidden="true">
        {cells.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />
        ))}
      </svg>
      {status && <i className="pavatar__dot" style={{ background: STATUS[status].color }} aria-hidden="true" />}
    </span>
  );
}
