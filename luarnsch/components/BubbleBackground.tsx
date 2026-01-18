
import React, { useEffect, useRef } from 'react';

const BubbleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bubbles: Bubble[] = [];
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // 選用色彩組合
    const colors = [
      '79, 70, 229',   // Indigo
      '124, 58, 237',  // Violet
      '37, 99, 235',   // Blue
      '219, 39, 119',  // Pink
      '5, 150, 105',   // Emerald
      '245, 158, 11',  // Amber/Gold
      '239, 68, 68',   // Red
    ];

    class Bubble {
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
      opacity: number;
      rgb: string;

      constructor() {
        this.rgb = colors[Math.floor(Math.random() * colors.length)];
        this.x = 0;
        this.y = 0;
        this.radius = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.opacity = 0;
        this.reset(true);
      }

      reset(initial = false) {
        if (!canvas) return;
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + 200;
        
        // 半徑設定
        this.radius = Math.random() * 250 + 150; 
        this.speedX = Math.random() * 0.6 - 0.3;
        this.speedY = -(Math.random() * 0.5 + 0.3); 
        
        // 調低透明度範圍 (原本 0.6~0.8 調降至 0.2~0.4)，使背景更柔和
        this.opacity = Math.random() * 0.2 + 0.25; 
        this.rgb = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.y < -this.radius) {
          this.reset();
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0, 
          this.x, this.y, this.radius
        );
        
        // 調整漸層淡出點，讓顏色從中心平滑擴散
        gradient.addColorStop(0, `rgba(${this.rgb}, ${this.opacity})`);
        gradient.addColorStop(0.5, `rgba(${this.rgb}, ${this.opacity * 0.4})`);
        gradient.addColorStop(1, `rgba(${this.rgb}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 微調邊緣反光點的亮度
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.3})`;
        ctx.fill();
        
        ctx.restore();
      }
    }

    const init = () => {
      bubbles = [];
      const count = Math.floor((window.innerWidth * window.innerHeight) / 40000); 
      for (let i = 0; i < Math.max(count, 18); i++) {
        bubbles.push(new Bubble());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bubbles.forEach(bubble => {
        bubble.update();
        bubble.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      resize();
      init();
    };

    window.addEventListener('resize', handleResize);
    
    resize();
    init();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[1] pointer-events-none opacity-80" />;
};

export default BubbleBackground;
