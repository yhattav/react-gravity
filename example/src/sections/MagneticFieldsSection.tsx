import React, { useRef, useState, useCallback, useEffect } from 'react';
import { CustomCursor } from '@yhattav/react-component-cursor';
import { Card, Typography } from 'antd';
import { motion } from 'framer-motion';

const { Title, Paragraph } = Typography;

interface MagneticPoint {
  x: number;
  y: number;
  label: string;
  mass: number;
  color: string;
}

const drawArrow = (
  x: number,
  y: number,
  vectorX: number,
  vectorY: number,
  color: string,
  scale: number = 1
) => {
  const length = Math.sqrt(vectorX * vectorX + vectorY * vectorY) * scale;
  const angle = Math.atan2(vectorY, vectorX);

  // Calculate end point using length
  const endX =
    x + (vectorX / Math.sqrt(vectorX * vectorX + vectorY * vectorY)) * length;
  const endY =
    y + (vectorY / Math.sqrt(vectorX * vectorX + vectorY * vectorY)) * length;

  // Arrow head size proportional to length
  const arrowSize = Math.min(length * 0.2, 10); // 20% of length, max 10px
  const arrowAngle = Math.PI / 6; // 30 degrees

  const arrowPoint1X = endX - arrowSize * Math.cos(angle - arrowAngle);
  const arrowPoint1Y = endY - arrowSize * Math.sin(angle - arrowAngle);
  const arrowPoint2X = endX - arrowSize * Math.cos(angle + arrowAngle);
  const arrowPoint2Y = endY - arrowSize * Math.sin(angle + arrowAngle);

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

interface MagneticFieldsSectionProps {
  onDebugData?: (data: any) => void;
}

export const MagneticFieldsSection: React.FC<MagneticFieldsSectionProps> = ({
  onDebugData,
}) => {
  const magneticRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [velocity, setVelocity] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const magneticElements: MagneticPoint[] = [
    { x: 700, y: 700, label: 'Heavy', mass: 50000, color: '#FF6B6B' },
    { x: 500, y: 150, label: 'Medium', mass: 30000, color: '#4ECDC4' },
    { x: 350, y: 250, label: 'Light', mass: 10000, color: '#45B7D1' },
  ];

  const calculateGravitationalForce = useCallback(
    (x1: number, y1: number, x2: number, y2: number, mass: number) => {
      if (!isFinite(x1) || !isFinite(y1) || !isFinite(x2) || !isFinite(y2)) {
        return { fx: 0, fy: 0 };
      }

      const G = 0.1;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = 30;
      const maxForce = 2;

      if (distance === 0) {
        return { fx: 0, fy: 0 };
      }

      const force = Math.min(
        (G * (mass * 1)) /
          Math.max(distance * distance, minDistance * minDistance),
        maxForce
      );

      const falloffStart = minDistance * 2;
      const smoothingFactor =
        distance < falloffStart ? Math.pow(distance / falloffStart, 0.5) : 1;

      const dirX = dx / distance;
      const dirY = dy / distance;

      return {
        fx: Number.isFinite(dirX * force) ? dirX * force * smoothingFactor : 0,
        fy: Number.isFinite(dirY * force) ? dirY * force * smoothingFactor : 0,
      };
    },
    []
  );

  const calculateTotalForce = useCallback(
    (cursorX: number, cursorY: number, pointerX: number, pointerY: number) => {
      let totalFx = 0;
      let totalFy = 0;
      // Add pointer gravitational pull (constant mass of 0.5)
      const pointerForce = calculateGravitationalForce(
        cursorX,
        cursorY,
        pointerX,
        pointerY,
        50000
      );
      totalFx += pointerForce.fx;
      totalFy += pointerForce.fy;

      // Add magnetic points gravitational pull
      magneticElements.forEach((magnet) => {
        const force = calculateGravitationalForce(
          cursorX,
          cursorY,
          magnet.x,
          magnet.y,
          magnet.mass
        );
        totalFx += force.fx;
        totalFy += force.fy;
      });

      return { fx: totalFx, fy: totalFy };
    },
    [calculateGravitationalForce]
  );

  // Use requestAnimationFrame for smooth cursor movement
  useEffect(() => {
    let animationFrameId: number;
    const currentVelocity = { x: 0, y: 0 };
    const friction = 0.95; // Changed from 1 to add some dampening

    const updateCursorPosition = () => {
      const force = calculateTotalForce(
        cursorPos.x,
        cursorPos.y,
        pointerPos.x,
        pointerPos.y
      );

      const fx = Number.isFinite(force.fx) ? force.fx : 0;
      const fy = Number.isFinite(force.fy) ? force.fy : 0;

      currentVelocity.x = Number.isFinite(currentVelocity.x + fx)
        ? (currentVelocity.x + fx) * friction
        : 0;
      currentVelocity.y = Number.isFinite(currentVelocity.y + fy)
        ? (currentVelocity.y + fy) * friction
        : 0;

      setVelocity(currentVelocity);

      setCursorPos((prev) => ({
        x: Number.isFinite(prev.x + currentVelocity.x)
          ? prev.x + currentVelocity.x
          : prev.x,
        y: Number.isFinite(prev.y + currentVelocity.y)
          ? prev.y + currentVelocity.y
          : prev.y,
      }));

      animationFrameId = requestAnimationFrame(updateCursorPosition);
    };

    animationFrameId = requestAnimationFrame(updateCursorPosition);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cursorPos, pointerPos, calculateTotalForce]);

  const handleCursorMove = useCallback((x: number, y: number) => {
    if (isFinite(x) && isFinite(y)) {
      setPointerPos({ x, y });
    }
  }, []);

  // Use effect to send debug data
  useEffect(() => {
    onDebugData?.({
      cursor: {
        position: cursorPos,
        velocity: velocity,
      },
      pointer: {
        position: pointerPos,
        force: calculateGravitationalForce(
          cursorPos.x,
          cursorPos.y,
          pointerPos.x,
          pointerPos.y,
          500
        ),
      },
      velocity: velocity,
      totalForce: calculateTotalForce(
        cursorPos.x,
        cursorPos.y,
        pointerPos.x,
        pointerPos.y
      ),
    });
  }, [
    cursorPos,
    pointerPos,
    velocity,
    calculateGravitationalForce,
    calculateTotalForce,
    onDebugData,
  ]);

  return (
    <Card
      ref={magneticRef}
      style={{
        height: '100%',
        position: 'relative',
        background: 'linear-gradient(45deg, #1a1a1a, #2a2a2a)',
        border: 'none',
        overflow: 'hidden',
      }}
    >
      <Title level={2} style={{ color: '#fff' }}>
        Magnetic Fields
      </Title>
      <Paragraph style={{ color: '#aaa' }}>
        Move your cursor near the magnetic points to feel the pull!
      </Paragraph>

      {/* Magnetic Points */}
      {magneticElements.map((point, index) => (
        <motion.div
          key={index}
          animate={{ scale: 1 }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'easeInOut',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: point.x,
              top: point.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: point.color,
                borderRadius: '50%',
                transition: 'all 0.3s ease',
                boxShadow: `0 0 10px ${point.color}`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: point.color,
                fontSize: '12px',
                fontWeight: 'bold',
                textShadow: '0 0 10px rgba(0,0,0,0.5)',
              }}
            >
              {point.label}
              <div
                style={{
                  width: '50px',
                  height: '4px',
                  background: `linear-gradient(90deg, ${point.color} ${
                    point.mass / 1000
                  }%, transparent ${point.mass / 1000}%)`,
                  borderRadius: '2px',
                  marginTop: '4px',
                }}
              />
            </div>
          </div>
        </motion.div>
      ))}

      <CustomCursor
        containerRef={magneticRef}
        smoothFactor={1}
        onMove={handleCursorMove}
      >
        <div style={{ position: 'relative' }}>
          {/* Cursor */}
          <motion.div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: 'transparent',
              border: '2px solid #666',
              borderRadius: '50%',
              position: 'absolute',
              left: cursorPos.x - pointerPos.x,
              top: cursorPos.y - pointerPos.y,
              transform: 'translate(-50%, -50%)',
              transition: 'border-color 0.2s ease',
              boxShadow: '0 0 20px rgba(255,255,255,0.2)',
            }}
          />

          {/* Vector visualization */}
          <svg
            style={{
              //position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            {/* Velocity vector */}
            {drawArrow(
              cursorPos.x - pointerPos.x,
              cursorPos.y - pointerPos.y,
              velocity.x,
              velocity.y,
              '#4CAF50', // Green
              200 // Scale factor to make the arrow visible
            )}

            {/* Force/Acceleration vector */}
            {drawArrow(
              cursorPos.x - pointerPos.x,
              cursorPos.y - pointerPos.y,
              calculateTotalForce(
                cursorPos.x,
                cursorPos.y,
                pointerPos.x,
                pointerPos.y
              ).fx,
              calculateTotalForce(
                cursorPos.x,
                cursorPos.y,
                pointerPos.x,
                pointerPos.y
              ).fy,
              '#FF4081', // Pink
              1000 // Different scale for force
            )}
          </svg>
        </div>
      </CustomCursor>
    </Card>
  );
};
