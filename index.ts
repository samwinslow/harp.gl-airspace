/*
 * Copyright (C) 2019-2021 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */

import { Feature, FeatureCollection, Theme } from '@here/harp-datasource-protocol'
import { GeoCoordinates } from '@here/harp-geoutils'
import { GeoJsonDataProvider, VectorTileDataSource } from '@here/harp-vectortile-datasource'
import { parseAltitude, MAP_COLORS, getAirspaceClass } from './utils'

import { View } from './View'

const app = new View({
  canvas: document.getElementById('map') as HTMLCanvasElement
})

const mapView = app.mapView

const addFeatureHeight = (feature: Feature): Feature => {
  const { geometry, properties } = feature
  if (!['Polygon', 'MultiPolygon'].includes(geometry.type) || !properties.Top) {
    return feature
  }

  const floorAltitude = parseAltitude(properties.Base ?? 'GND')
  const ceilAltitude = parseAltitude(properties.Top)
  return {
    ...feature,
    properties: {
      ...feature.properties,
      min_height: floorAltitude.agl,
      height: ceilAltitude.agl,
    }
  }
}

const setFeatureAppearance = (feature: Feature): Feature => {
  const { geometry, properties } = feature
  const cls = getAirspaceClass(properties.Name)
  let fillColor = MAP_COLORS.black
  let lineColor = MAP_COLORS.black
  let fillOpacity = 0.25

  if (cls === 'a') {
    fillColor = MAP_COLORS.magenta
  } else if (cls === 'b') {
    fillColor = MAP_COLORS.cyan
    lineColor = MAP_COLORS.cyan
    fillOpacity = 0.5
  } else if (cls === 'c') {
    fillColor = MAP_COLORS.magenta
    lineColor = MAP_COLORS.magenta
    fillOpacity = 0.5
  } else if (cls === 'd') {
    fillColor = MAP_COLORS.cyan
    lineColor = MAP_COLORS.cyan
  } else if (cls === 'e') {
    fillColor = MAP_COLORS.magenta
    lineColor = 'transparent'
    fillOpacity = 0.1
  } else if (cls === 'danger') {
    fillColor = MAP_COLORS.red
    lineColor = MAP_COLORS.black
    fillOpacity = 0.5
  } else if (cls === 'alert' || cls === 'restricted') {
    fillColor = MAP_COLORS.red
    lineColor = MAP_COLORS.black
    fillOpacity = 0.75
  }
  return {
    ...feature,
    properties: {
      ...feature.properties,
      fillColor,
      fillOpacity,
      lineColor,
    }
  }
}

const processFeatures = (
  features: FeatureCollection, 
  transforms: ((feature: Feature) => Feature)[]
): FeatureCollection => {
  const { features: collection } = features
  return {
    ...features,
    features: collection.map((feature) => {
      let result = feature
      for (const transform of transforms) {
        result = transform(result)
      }
      return result
    })
  }
}

const getStateBoundaries = async () => {
  const res = await fetch('resources/gz_2010_us_outline_5m.geojson')
  const geojson = await res.json()
  const dataProvider = new GeoJsonDataProvider('states', geojson)
  const dataSource = new VectorTileDataSource({
    dataProvider,
    name: 'states',
    styleSetName: 'geojson',
  })

  await mapView.addDataSource(dataSource)

  const theme: Theme = {
    styles: {
      geojson: [
        {
          when: ['==', ['geometry-type'], 'LineString'],
          technique: 'line',
          color: '#000',
        },
      ]
    }
  }
  dataSource.setTheme(theme)
}

const getAirspace = async () => {
  const res = await fetch('resources/united_states.geojson')
  const geojson = await res.json()
  const data = processFeatures(geojson, [addFeatureHeight, setFeatureAppearance])
  const dataProvider = new GeoJsonDataProvider('airspace', data)
  const dataSource = new VectorTileDataSource({
    dataProvider,
    name: 'airspace',
    styleSetName: 'geojson',
  })

  await mapView.addDataSource(dataSource)

  const theme: Theme = {
    styles: {
      geojson: [
        {
          when: ['==', ['geometry-type'], 'Point'],
          technique: 'text',
          color: '#000',
          size: 15,
        },
        {
          when: ['==', ['geometry-type'], 'Polygon'],
          technique: 'extruded-polygon',
          color: ['get', 'fillColor'],
          lineColor: ['get', 'lineColor'],
          opacity: ['get', 'fillOpacity'],
          transparent: true,
          lineColorMix: 0,
          lineWidth: 1,
        },
        {
          when: ['==', ['geometry-type'], 'MultiPolygon'],
          technique: 'extruded-polygon',
          color: ['get', 'fillColor'],
          lineColor: ['get', 'lineColor'],
          opacity: ['get', 'fillOpacity'],
          transparent: true,
          lineColorMix: 0,
          lineWidth: 1,
        },
      ],
    },
  }
  dataSource.setTheme(theme)
}



// make map full-screen
mapView.resize(window.innerWidth, window.innerHeight)

// react on resize events from the browser.
window.addEventListener('resize', () => {
  mapView.resize(window.innerWidth, window.innerHeight)
})

// center the camera to New York
mapView.lookAt({ target: new GeoCoordinates(40.70398928, -74.01319808), zoomLevel: 10, tilt: 40 })

// make sure the map is rendered
getStateBoundaries()
getAirspace()
mapView.update()

