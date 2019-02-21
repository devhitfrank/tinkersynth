// @flow
import React, { useRef, useEffect, useContext } from 'react';

import { COLORS } from '../../constants';
import { clamp, mix, normalize } from '../../utils';
import { renderPolylines } from '../../vendor/polylines';
import {
  getScaledCanvasProps,
  getDevicePixelRatio,
} from '../../helpers/canvas.helpers';

import transformParameters from './Slopes.params';
import Worker from './SlopesCanvas.worker';
import { getRenderOptions } from './SlopesCanvas.helpers';

type Props = {
  width: number,
  height: number,
  kind: 'main' | 'framed-preview',
};

const useCanvasDrawing = (
  canvasRef,
  devicePixelRatio,
  scaleRatio,
  width,
  height,
  kind,
  params
) => {
  // In SSR mode, we don't want to try and do any of this.
  if (typeof window === 'undefined') {
    return;
  }

  // Create a worker. This will be a long-lived worker, we use for all drawing.
  const worker = useRef(null);
  useEffect(() => {
    worker.current = new Worker();

    return () => {
      worker.current.terminate();
    };
  }, []);

  const supportsOffscreenCanvas = 'OffscreenCanvas' in window;
  const hasSentCanvas = useRef(false);

  // On mount, set up the worker message-handling
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    // If the browser supports it, all we need to do is transfer control.
    // The actual calculating and updating will happen in SlopesCanvas.worker.
    if (supportsOffscreenCanvas) {
      canvasRef.current = canvasRef.current.transferControlToOffscreen();
    } else {
      const context = canvasRef.current.getContext('2d');
      context.scale(devicePixelRatio, devicePixelRatio);

      if (!worker.current) {
        return;
      }

      worker.current.onmessage = function({ data }) {
        const { lines, ...passedData } = data;

        if (!lines) {
          return;
        }

        renderPolylines(
          lines,
          getRenderOptions(
            width,
            height,
            kind,
            context,
            devicePixelRatio,
            scaleRatio,
            passedData
          )
        );
      };
    }
  }, []);

  // Redraw on every render.
  // `React.memo` should ensure that only the pertinent updates cause
  // a re-render.
  useEffect(() => {
    // The user can tweak "high-level parameters" like spikyness, perspective,
    // etc. These values need to be reduced to low-level variables used in
    // calculation. There is not a 1:1 mapping between them: a single
    // high-level param might tweak several low-level vars, and the same
    // variable might be affected by multiple params.
    // $FlowFixMe
    const drawingVariables = transformParameters({
      height,
      ...params,
    });

    let messageData = {
      width,
      height,
      kind,
      supportsOffscreenCanvas,
      scaleRatio,
      devicePixelRatio,
      ...drawingVariables,
    };
    let transfer = undefined;

    // If this is the very first time we're painting to the canvas, we need
    // to send it along, using the cumbersome "data and transfer" API.
    // More info: https://developers.google.com/web/updates/2018/08/offscreen-canvas
    if (supportsOffscreenCanvas && !hasSentCanvas.current) {
      // $FlowFixMe
      messageData.canvas = canvasRef.current;
      transfer = [canvasRef.current];

      hasSentCanvas.current = true;
    }

    if (!worker.current) {
      return;
    }

    worker.current.postMessage(messageData, transfer);
  });
};

const SlopesCanvas = ({
  width,
  height,
  kind,
  scaleRatio = 1,
  ...params
}: Props) => {
  const canvasRef = useRef(null);

  const { style, ...dimensions } = getScaledCanvasProps(width, height);
  const devicePixelRatio = getDevicePixelRatio();

  useCanvasDrawing(
    canvasRef,
    devicePixelRatio,
    scaleRatio,
    width,
    height,
    kind,
    params
  );

  return (
    <canvas
      ref={canvasRef}
      {...dimensions}
      style={{
        ...style,
        display: 'block',
      }}
    />
  );
};

// $FlowIgnore
export default React.memo(SlopesCanvas);
