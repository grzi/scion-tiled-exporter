/// <reference types="@mapeditor/tiled-api" />

tiled.registerMapFormat("scion", {
    name: "Scion engine format", extension: "json",

    write: (map, fileName) => {
        let jsonFormattedMap;
        try {
            let formattedMap = buildScionMap(map);
            jsonFormattedMap = JSON.stringify(formattedMap);
            let file = new TextFile(fileName, TextFile.WriteOnly);
            file.write(jsonFormattedMap);
            file.commit();
        } catch (e) {
            console.error(e);
            return e;
        }
        return null;
    },
});


function buildScionMap(map) {
    return {
        width: map.width,
        height: map.height,
        properties: map.properties(),
        layers: buildLayers(map),
        objects: buildObjects(map)
    }
}

function buildLayers(map) {
    let layers = [];
    for (let i = 0; i < map.layerCount; ++i) {
        const currentLayer = map.layerAt(i);
        if (currentLayer.isTileLayer) {
            layers.push(buildSingleLayer(currentLayer));
        }
    }
    return layers;
}

function buildSingleLayer(layer) {
    let layerTiles = [];
    for (let y = 0; y < layer.height; ++y) {
        const row = [];
        for (let x = 0; x < layer.width; ++x) {
            let tile = layer.tileAt(x, y);
            if (tile) {
                row.push(tile.id);
            } else {
                row.push(-1);
            }
        }
        layerTiles.push(row);
    }


    return {
        name: layer.name,
        tiles: layerTiles
    };
}

function buildObjects(map) {
    let objects = [];
    let tile_height = map.tileHeight;
    let tile_width = map.tileWidth;
    for (let i = 0; i < map.layerCount; ++i) {
        const currentLayer = map.layerAt(i);
        if (currentLayer.isObjectLayer) {
            currentLayer.objects
                .forEach(o => {
                    if (!hasObjectType(o)) {
                        throw new Error("Object at x:" + o.x + ", y:" + o.y + " is missing its  ObjectType property");
                    }
                    objects.push({
                        name: o.name,
                        x: o.x / tile_width,
                        y: o.y / tile_height,
                        properties: o.properties()
                    });
                });
        }
    }
    return objects;
}

function hasObjectType(object) {
    return object
        && object.properties()
        && object.properties()['ObjectType']
        && object.properties()['ObjectType'].length !== 0;
}