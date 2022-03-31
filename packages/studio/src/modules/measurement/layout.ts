export interface Layout {
  background?: string;
  children: Pane[];
}

export function layout(layout: Layout) {
  return { layout };
}

export interface Pane {
  background?: string;
  children: Layer[];
}

export function pane(pane: Pane) {
  return pane;
}

export interface Layer {
  name: string;
}

export interface LinearLayer extends Layer {
  transform: (measurement: any) => number;
}

export function linear(layer: LinearLayer) {
  return layer;
}
