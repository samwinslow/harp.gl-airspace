/*
 * Copyright (C) 2019-2021 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */

import { Feature, FeatureCollection, Theme } from '@here/harp-datasource-protocol'
import { GeoCoordinates } from '@here/harp-geoutils'
import { GeoJsonDataProvider, VectorTileDataSource } from '@here/harp-vectortile-datasource'
import { parseAltitude } from './utils'

import { View } from './View'

const app = new View({
  canvas: document.getElementById('map') as HTMLCanvasElement
})

const mapView = app.mapView

const airspaceDataPath = 'resources/united_states.geojson'

const addFeatureHeight = (feature: Feature): Feature => {
  const { geometry, properties } = feature
  if (geometry.type !== 'Polygon' || !properties.Top) {
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

const processFeatures = (features: FeatureCollection): FeatureCollection => {
  const { features: collection } = features
  return {
    ...features,
    features: collection.map(addFeatureHeight)
  }
}

const getAirspace = async () => {
  const res = await fetch(airspaceDataPath)
  const data = processFeatures(await res.json())
  console.log(data)
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
          technique: 'circles',
          renderOrder: 2,
          color: '#FF0000',
          size: 15,
        },
        {
          when: ['==', ['geometry-type'], 'Polygon'],
          technique: 'extruded-polygon',
          renderOrder: 1,
          color: 'rgb(0,0,255)',
          lineColor: 'rgb(0,0,128)',
          opacity: 0.5,
          transparent: true,
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
mapView.lookAt({ target: new GeoCoordinates(40.70398928, -74.01319808), zoomLevel: 4, tilt: 40 })

// make sure the map is rendered
getAirspace()
mapView.update()

