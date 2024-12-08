import Paper from "paper";

export const drawArrow = (
  x: number,
  y: number,
  vectorX: number,
  vectorY: number,
  color: string,
  scale: number = 1
) => {
  // Validate inputs
  if (
    !isFinite(x) ||
    !isFinite(y) ||
    !isFinite(vectorX) ||
    !isFinite(vectorY)
  ) {
    console.warn("Invalid coordinates in drawArrow:", {
      x,
      y,
      vectorX,
      vectorY,
    });
    return null;
  }

  // Check for zero vector
  const vectorLength = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
  if (vectorLength === 0) {
    return null; // Don't render arrow for zero vectors
  }

  const length = vectorLength * scale;
  const angle = Math.atan2(vectorY, vectorX);

  // Normalize vector components
  const normalizedX = vectorX / vectorLength;
  const normalizedY = vectorY / vectorLength;

  const endX = x + normalizedX * length;
  const endY = y + normalizedY * length;

  // Validate calculated points
  if (!isFinite(endX) || !isFinite(endY)) {
    console.warn("Invalid end points in drawArrow:", { endX, endY });
    return null;
  }

  const arrowSize = Math.min(length * 0.2, 10);
  const arrowAngle = Math.PI / 6;

  const arrowPoint1X = endX - arrowSize * Math.cos(angle - arrowAngle);
  const arrowPoint1Y = endY - arrowSize * Math.sin(angle - arrowAngle);
  const arrowPoint2X = endX - arrowSize * Math.cos(angle + arrowAngle);
  const arrowPoint2Y = endY - arrowSize * Math.sin(angle + arrowAngle);

  // Final validation of all points
  if (
    !isFinite(arrowPoint1X) ||
    !isFinite(arrowPoint1Y) ||
    !isFinite(arrowPoint2X) ||
    !isFinite(arrowPoint2Y)
  ) {
    console.warn("Invalid arrow points:", {
      arrowPoint1X,
      arrowPoint1Y,
      arrowPoint2X,
      arrowPoint2Y,
    });
    return null;
  }

  return (
    <>
      <line x1={x} y1={y} x2={endX} y2={endY} stroke={color} strokeWidth="2" />
      <line
        x1={endX}
        y1={endY}
        x2={arrowPoint1X}
        y2={arrowPoint1Y}
        stroke={color}
        strokeWidth="2"
      />
      <line
        x1={endX}
        y1={endY}
        x2={arrowPoint2X}
        y2={arrowPoint2Y}
        stroke={color}
        strokeWidth="2"
      />
    </>
  );
};

export const createPaperArrow = (
  from: paper.Point,
  direction: paper.Point,
  color: string,
  scale: number = 20,
  arrowSize: number = 8
): paper.Group => {
  const to = from.add(direction.multiply(scale));

  // Create the main line
  const line = new Paper.Path({
    segments: [from, to],
    strokeColor: color,
    strokeWidth: 2,
    strokeCap: "round",
  });

  // Create arrowhead
  const arrowHead = new Paper.Path({
    strokeColor: color,
    fillColor: color,
    strokeWidth: 1,
    closed: true,
  });

  const arrowDirection = direction.normalize(arrowSize);
  const arrowLeft = to.subtract(
    arrowDirection.rotate(315, new Paper.Point(0, 0))
  );
  const arrowRight = to.subtract(
    arrowDirection.rotate(45, new Paper.Point(0, 0))
  );

  arrowHead.add(to);
  arrowHead.add(arrowLeft);
  arrowHead.add(arrowRight);

  // Group the line and arrowhead
  return new Paper.Group([line, arrowHead]);
};
