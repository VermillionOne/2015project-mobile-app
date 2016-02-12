/*global window*/
/**
 * Global device object - storing device data 
 *
 * @type {Object}
**/
var device = {
  upload: {},
  screen: null,
  platform: null,
  version: null,
  major: null,
  resMap: {
    ios: {
      '320x568': '640x1136',
      '375x627': '750x1334',
      '568x320': '640x1136',
      '375x667': '750x1334',
      '414x736': '1080x1920',
      '1024x768': '1024x768',
      '768x1024': '768x1024',
      retina: {
        '320x568': '640x1136',
        '375x627': '750x1334',
        '375x667': '750x1334',
        '768x1024': '1536x2048',
        '1024x768': '2048x1536',
        '414x736': '2208x1242'
      }
    },
    android: {
      '320x533': '480x800',
      '427x320': '320x240',
      '480x320': '480x800',
      '600x384': '1200x768',
      '384x640': '768x1200',
      '480x800': '480x800',
      '384x600': '768x1200',
      '600x960': '800x1280',
      '600x933': '900x1400',
      '360x640': '1080x1920',
      '800x1280': '1080x1920',
      hd: {
        '1280x800': '2560x1600'
      }
    }
  },
  settings: {},
  resolution: null,
  isHd: function() {
    return window.devicePixelRatio > 3;
  },
  isRetina: function() {
    return (window.retina || window.devicePixelRatio >= 2);
  }
};
