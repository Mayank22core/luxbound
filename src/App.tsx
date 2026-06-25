import { useEffect, useRef, useCallback, useState } from 'react';
import { createEngine, type Engine } from './engine/Engine';
import { createInputManager, type InputManager } from './managers/InputManager';
import { createMovementSystem } from './systems/movement/MovementSystem';
import { createPlayerVisualSystem } from './systems/rendering/PlayerVisualSystem';
import { createCameraFollowSystem } from './systems/rendering/CameraFollowSystem';
import { createGhostModeSystem } from './systems/debug/GhostModeSystem';
import { generateDungeon, renderDungeon, type DungeonMeshGroup } from './systems/dungeon';
import type { DungeonData } from './systems/dungeon/DungeonTypes';
import { createLightSystem } from './systems/light';
import type { LightSystem } from './systems/light';
import { getPlatform, isTouchDevice } from './services/PlatformManager';
import { createLightSensorService, type LightSensorService } from './services/LightSensorService';
import { useGameStore } from './ui/hooks/useGameState';
import { useGhostStore } from './ui/hooks/useGhostStore';
import { useTouchInput } from './ui/hooks/useTouchInput';
import { GameState } from './constants/GameState';
import { HUD } from './ui/components/HUD';
import { MainMenu } from './ui/components/MainMenu';
import { DebugPanel } from './ui/components/DebugPanel';
import { DebugInfo } from './ui/components/DebugInfo';
import { MapOverlay } from './ui/components/MapOverlay';
import { PlayerMap } from './ui/components/PlayerMap';
import { Minimap } from './ui/components/Minimap';
import { MobileControls } from './ui/components/MobileControls';
import { Logger, LogLevel } from './core/utils/Logger';
import { DUNGEON_CONFIG } from './config/dungeon';
import { DEV_CONFIG } from './config/dev';
import type { TransformData, VelocityData } from './core/types/game';
import type { World } from './core/ecs';

Logger.setLevel(LogLevel.DEBUG);

const platform = getPlatform();
const touchDevice = isTouchDevice();

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const inputRef = useRef<InputManager | null>(null);
  const dungeonRef = useRef<DungeonMeshGroup | null>(null);
  const dungeonDataRef = useRef<DungeonData | null>(null);
  const lightSystemRef = useRef<LightSystem | null>(null);
  const sensorRef = useRef<LightSensorService | null>(null);
  const gameStateRef = useRef<GameState>(GameState.MENU);
  const spawnPosRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const [initialized, setInitialized] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [playerMapPos, setPlayerMapPos] = useState({ x: 0, z: 0 });
  const [currentRoom, setCurrentRoom] = useState(-1);
  const [debugInfo, setDebugInfo] = useState({
    playerX: 0,
    playerZ: 0,
    cameraX: 0,
    cameraY: 0,
    cameraZ: 0,
    currentRoom: 0,
    luxValue: 0,
    fps: 0,
  });

  const gameState = useGameStore((s) => s.state);
  const setGameState = useGameStore((s) => s.setState);
  const setPlayerHealth = useGameStore((s) => s.setPlayerHealth);
  const setDungeonInfo = useGameStore((s) => s.setDungeonInfo);

  gameStateRef.current = gameState;

  const spawnPlayer = useCallback((world: World, startX: number, startZ: number) => {
    const playerId = world.addEntity();
    world.addComponent<TransformData>(playerId, 'transform', {
      position: { x: startX, y: 0.5, z: startZ },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    });
    world.addComponent<VelocityData>(playerId, 'velocity', {
      x: 0,
      y: 0,
      z: 0,
      maxSpeed: 5,
    });
    world.addComponent(playerId, 'player', {});
    world.addComponent(playerId, 'health', {
      current: 100,
      max: 100,
      regenRate: 0,
    });
    Logger.info('Player spawned at dungeon entrance');
  }, []);

  const initEngine = useCallback(() => {
    if (!canvasRef.current || engineRef.current) return;

    const input = createInputManager();
    input.init();
    inputRef.current = input;

    const engine = createEngine(canvasRef.current);
    engineRef.current = engine;

    const lightSystem = createLightSystem();
    lightSystemRef.current = lightSystem;

    if (touchDevice) {
      const sensor = createLightSensorService();
      sensorRef.current = sensor;
      sensor.onUpdate = (level) => {
        lightSystem.setSensorLevel(level);
      };
      sensor.start().catch(() => {
        Logger.debug('LightSensor: failed to start (web fallback)');
      });
    }

    Logger.info('Generating dungeon...');
    const dungeonData = generateDungeon(Date.now());
    dungeonDataRef.current = dungeonData;
    const dungeonMeshes = renderDungeon(dungeonData);
    dungeonRef.current = dungeonMeshes;
    engine.scene.add(dungeonMeshes.group);

    const seed = Date.now();
    setDungeonInfo(seed, dungeonData.rooms.length);

    const playerStartX = dungeonData.playerStart.x * DUNGEON_CONFIG.CELL_SIZE;
    const playerStartZ = dungeonData.playerStart.z * DUNGEON_CONFIG.CELL_SIZE;
    spawnPosRef.current = { x: playerStartX, z: playerStartZ };
    spawnPlayer(engine.world, playerStartX, playerStartZ);

    engine.addSystem(createMovementSystem(input, engine, dungeonMeshes.colliders));
    engine.addSystem(createPlayerVisualSystem(engine));
    engine.addSystem(createCameraFollowSystem(input, engine));

    if (DEV_CONFIG.DEV_MODE) {
      engine.addSystem(createGhostModeSystem(input, engine));
    }

    engine.start();
    setInitialized(true);
    Logger.info(`Phase 4 initialized — platform: ${platform.platform}, touch: ${touchDevice}`);
  }, [spawnPlayer, setDungeonInfo]);

  useEffect(() => {
    initEngine();

    return () => {
      sensorRef.current?.destroy();
      dungeonRef.current?.dispose();
      engineRef.current?.destroy();
      inputRef.current?.destroy();
      engineRef.current = null;
      inputRef.current = null;
      dungeonRef.current = null;
      lightSystemRef.current = null;
      sensorRef.current = null;
    };
  }, [initEngine]);

  useEffect(() => {
    if (!engineRef.current || !initialized) return;

    let frameCount = 0;
    let lastFpsTime = performance.now();

    function onKeyDown(e: KeyboardEvent): void {
      if (e.code === 'Space' && gameStateRef.current === GameState.PLAYING) {
        e.preventDefault();
        const ls = lightSystemRef.current;
        if (ls && !ls.sensorMode) {
          ls.cycle();
        }
      }
    }
    window.addEventListener('keydown', onKeyDown);

    const interval = setInterval(() => {
      const engine = engineRef.current;
      const world = engine?.world;
      if (!engine || !world) return;

      const ghost = useGhostStore.getState();
      const input = inputRef.current;
      const ls = lightSystemRef.current;

      if (input) {
        setShowMap(input.state.showMap);
      }

      if (ls) {
        ls.update(0.1, world);
        engine.lighting.setLightLevel(ls.currentLevel);
      }

      const players = world.query('transform', 'player', 'health');
      if (players.length > 0) {
        const health = world.getComponent<{ current: number; max: number }>(
          players[0],
          'health'
        );
        if (health) {
          setPlayerHealth(health.current, health.max);
        }

        const transform = world.getComponent<TransformData>(
          players[0],
          'transform'
        );
        if (transform) {
          setPlayerMapPos({ x: transform.position.x, z: transform.position.z });

          const gridX = Math.round(transform.position.x / DUNGEON_CONFIG.CELL_SIZE);
          const gridZ = Math.round(transform.position.z / DUNGEON_CONFIG.CELL_SIZE);
          const dd = dungeonDataRef.current;
          if (dd && gridX >= 0 && gridX < dd.gridWidth && gridZ >= 0 && gridZ < dd.gridHeight) {
            const room = dd.roomGrid[gridZ][gridX];
            setCurrentRoom(room);
          }

          if (ghost.enabled && ghost.showDebugInfo) {
            const now = performance.now();
            frameCount++;

            let debugRoom = -1;
            if (dd && gridX >= 0 && gridX < dd.gridWidth && gridZ >= 0 && gridZ < dd.gridHeight) {
              debugRoom = dd.roomGrid[gridZ][gridX];
            }

            const luxDisplay = ls ? ls.currentLevel * 1000 : 0;

            if (now - lastFpsTime >= 1000) {
              setDebugInfo({
                playerX: transform.position.x,
                playerZ: transform.position.z,
                cameraX: engine.camera.camera.position.x,
                cameraY: engine.camera.camera.position.y,
                cameraZ: engine.camera.camera.position.z,
                currentRoom: debugRoom,
                luxValue: luxDisplay,
                fps: frameCount,
              });
              frameCount = 0;
              lastFpsTime = now;
            } else {
              setDebugInfo((prev) => ({
                ...prev,
                playerX: transform.position.x,
                playerZ: transform.position.z,
                cameraX: engine.camera.camera.position.x,
                cameraY: engine.camera.camera.position.y,
                cameraZ: engine.camera.camera.position.z,
                currentRoom: debugRoom,
                luxValue: luxDisplay,
              }));
            }
          }
        }
      }
    }, 100);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [initialized, setPlayerHealth]);

  const handleStart = useCallback(() => {
    const engine = engineRef.current;
    const ls = lightSystemRef.current;

    if (ls && !ls.sensorMode) {
      ls.setLevel(0.6);
    }

    if (engine) {
      const players = engine.world.query('transform', 'player', 'health');
      if (players.length > 0) {
        const transform = engine.world.getComponent<TransformData>(players[0], 'transform');
        if (transform) {
          transform.position.x = spawnPosRef.current.x;
          transform.position.z = spawnPosRef.current.z;
        }
        const health = engine.world.getComponent<{ current: number; max: number }>(players[0], 'health');
        if (health) {
          health.current = 100;
        }
      }
    }

    useTouchInput.getState().setActive(touchDevice);
    setPlayerHealth(100, 100);
    setGameState(GameState.PLAYING);

    if (canvasRef.current && inputRef.current && !touchDevice) {
      inputRef.current.requestPointerLock(canvasRef.current);
    }
  }, [setGameState, setPlayerHealth]);

  const handleSettings = useCallback(() => {
    Logger.debug('Settings not yet implemented');
  }, []);

  const handleCanvasClick = useCallback(() => {
    if (gameState === GameState.PLAYING && canvasRef.current && inputRef.current && !touchDevice) {
      if (!document.pointerLockElement) {
        inputRef.current.requestPointerLock(canvasRef.current);
      }
    }
  }, [gameState]);

  return (
    <div
      id="game-canvas-container"
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#000',
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          touchAction: 'none',
          cursor: gameState === GameState.PLAYING && !touchDevice ? 'none' : 'default',
        }}
      />

      {(gameState === GameState.MENU || gameState === GameState.DEATH) && (
        <MainMenu onStart={handleStart} onSettings={handleSettings} />
      )}

      {gameState === GameState.PLAYING && (
        <>
          <HUD />
          <Minimap
            dungeonData={dungeonDataRef.current}
            playerX={playerMapPos.x}
            playerZ={playerMapPos.z}
            currentRoom={currentRoom}
          />
          {touchDevice && <MobileControls />}
        </>
      )}

      {gameState === GameState.PLAYING && DEV_CONFIG.DEV_MODE && <DebugPanel />}
      {gameState === GameState.PLAYING && DEV_CONFIG.DEV_MODE && (
        <DebugInfo {...debugInfo} />
      )}
      {gameState === GameState.PLAYING && DEV_CONFIG.DEV_MODE && (
        <MapOverlay
          dungeonData={dungeonDataRef.current}
          playerX={debugInfo.playerX}
          playerZ={debugInfo.playerZ}
          cameraX={debugInfo.cameraX}
          cameraZ={debugInfo.cameraZ}
        />
      )}
      {gameState === GameState.PLAYING && !touchDevice && (
        <PlayerMap
          visible={showMap}
          dungeonData={dungeonDataRef.current}
          playerX={playerMapPos.x}
          playerZ={playerMapPos.z}
        />
      )}
    </div>
  );
}
