// 引入 Howler 库
const { Howl, Howler } = require('../src/howler.core.js');

describe('Howler Core Tests', () => {
  // 模拟 Audio 对象
  const mockAudio = {
    play: jest.fn().mockReturnValue(Promise.resolve()),
    pause: jest.fn(),
    load: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    muted: false,
    volume: 1,
    currentTime: 0,
    duration: 5,
    readyState: 4
  };

  // 模拟 AudioContext
  const mockAudioContext = {
    createBuffer: jest.fn(),
    createBufferSource: jest.fn(() => ({
      buffer: null,
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      loop: false,
      loopStart: 0,
      loopEnd: 0,
      playbackRate: {
        setValueAtTime: jest.fn()
      }
    })),
    createGain: jest.fn(() => ({
      gain: {
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
        cancelScheduledValues: jest.fn()
      },
      connect: jest.fn()
    })),
    destination: {},
    currentTime: 0,
    state: 'running',
    resume: jest.fn().mockReturnValue(Promise.resolve()),
    suspend: jest.fn().mockReturnValue(Promise.resolve())
  };

  // 模拟 XMLHttpRequest
  const mockXHR = {
    open: jest.fn(),
    send: jest.fn(),
    setRequestHeader: jest.fn(),
    withCredentials: false,
    responseType: '',
    status: 200,
    response: new ArrayBuffer(0)
  };

  beforeEach(() => {
    // 重置模拟
    jest.clearAllMocks();
    
    // 重置 Howler 状态
    if (typeof Howler !== 'undefined') {
      Howler._howls = [];
      Howler._codecs = {
        mp3: true,
        ogg: true,
        wav: true,
        aac: true,
        m4a: true,
        webm: true
      };
    }
    
    // 模拟全局对象
    global.Audio = jest.fn(() => mockAudio);
    global.AudioContext = jest.fn(() => mockAudioContext);
    global.XMLHttpRequest = jest.fn(() => mockXHR);
    global.window = {
      location: { protocol: 'http:' },
      navigator: { userAgent: 'Mozilla/5.0' }
    };
    global.document = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    global.Date = {
      now: jest.fn(() => 1000)
    };
    global.setTimeout = jest.fn((fn) => {
      fn();
      return 1;
    });
    global.clearTimeout = jest.fn();
    global.setInterval = jest.fn((fn) => {
      fn();
      return 1;
    });
    global.clearInterval = jest.fn();
  });

  test('should create a new Howl instance', () => {
    const sound = new Howl({
      src: ['test.mp3']
    });
    
    expect(sound).toBeDefined();
    expect(sound._state).toBe('loading');
  });

  test('should handle play method', () => {
    const sound = new Howl({
      src: ['test.mp3']
    });
    
    // 模拟加载完成
    sound._state = 'loaded';
    sound._sprite = { __default: [0, 5000] };
    
    const id = sound.play();
    expect(typeof id).toBe('number');
  });

  test('should handle pause method', () => {
    const sound = new Howl({
      src: ['test.mp3']
    });
    
    // 模拟加载完成
    sound._state = 'loaded';
    sound._sprite = { __default: [0, 5000] };
    
    const id = sound.play();
    sound.pause(id);
    
    const soundObj = sound._soundById(id);
    expect(soundObj._paused).toBe(true);
  });

  test('should handle stop method', () => {
    const sound = new Howl({
      src: ['test.mp3']
    });
    
    // 模拟加载完成
    sound._state = 'loaded';
    sound._sprite = { __default: [0, 5000] };
    
    const id = sound.play();
    sound.stop(id);
    
    const soundObj = sound._soundById(id);
    expect(soundObj._paused).toBe(true);
  });

  test('should handle volume method', () => {
    const sound = new Howl({
      src: ['test.mp3'],
      volume: 0.5
    });
    
    // 测试获取音量
    expect(sound.volume()).toBe(0.5);
  });

  test('should handle mute method', () => {
    const sound = new Howl({
      src: ['test.mp3']
    });
    
    // 测试静音
    sound.mute(true);
    // 测试取消静音
    sound.mute(false);
  });

  test('should handle rate method', () => {
    const sound = new Howl({
      src: ['test.mp3']
    });
    
    // 测试设置速率
    sound.rate(1.5);
  });

  test('should handle loop method', () => {
    const sound = new Howl({
      src: ['test.mp3']
    });
    
    // 测试设置循环
    sound.loop(true);
    expect(sound._loop).toBe(true);
    
    // 测试取消循环
    sound.loop(false);
    expect(sound._loop).toBe(false);
  });

  test('should handle sprite playback', () => {
    const sound = new Howl({
      src: ['test.mp3'],
      sprite: {
        test: [0, 1000]
      }
    });
    
    // 模拟加载完成
    sound._state = 'loaded';
    
    const id = sound.play('test');
    expect(typeof id).toBe('number');
  });

  test('should handle fade method', () => {
    const sound = new Howl({
      src: ['test.mp3']
    });
    
    // 模拟加载完成
    sound._state = 'loaded';
    sound._sprite = { __default: [0, 5000] };
    
    const id = sound.play();
    sound.fade(1, 0, 1000, id);
  });

  test('should handle Howler global volume', () => {
    const initialVolume = Howler.volume();
    expect(typeof initialVolume).toBe('number');
    expect(initialVolume).toBeGreaterThanOrEqual(0);
    expect(initialVolume).toBeLessThanOrEqual(1);
    
    // 测试设置全局音量
    Howler.volume(0.5);
    expect(Howler.volume()).toBe(0.5);
  });

  test('should handle Howler global mute', () => {
    Howler.mute(true);
    expect(Howler._muted).toBe(true);
    
    Howler.mute(false);
    expect(Howler._muted).toBe(false);
  });

  test('should handle Howler stop all', () => {
    const sound1 = new Howl({ src: ['test1.mp3'] });
    const sound2 = new Howl({ src: ['test2.mp3'] });
    
    // 模拟加载完成
    sound1._state = 'loaded';
    sound1._sprite = { __default: [0, 5000] };
    sound2._state = 'loaded';
    sound2._sprite = { __default: [0, 5000] };
    
    // 播放两个声音
    sound1.play();
    sound2.play();
    
    // 停止所有声音
    Howler.stop();
  });

  test('should handle Howler unload', () => {
    const sound = new Howl({ src: ['test.mp3'] });
    
    Howler.unload();
  });

  test('should handle codec detection', () => {
    // 测试各种音频格式的编解码器检测
    const codecs = [
      'mp3', 'ogg', 'wav', 'aac', 'm4a', 'webm'
    ];
    
    codecs.forEach(codec => {
      const supported = Howler.codecs(codec);
      expect(typeof supported).toBe('boolean');
    });
  });
});
