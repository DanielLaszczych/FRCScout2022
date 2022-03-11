(function () {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema
    myConnector.getSchema = function (schemaCallback) {
        var cols = [
            {
                id: 'teamNumber',
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: 'matchNumber',
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: 'scouter',
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: 'station',
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: 'preLoadedCargo',
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: 'startingPositionX',
                dataType: tableau.dataTypeEnum.float,
            },
            {
                id: 'startingPositionY',
                dataType: tableau.dataTypeEnum.float,
            },
            {
                id: 'missedAuto',
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: 'lowerCargoAuto',
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: 'upperCargoAuto',
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: 'crossTarmac',
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: 'autoComment',
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: 'missedTele',
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: 'lowerCargoTele',
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: 'upperCargoTele',
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: 'climbTime',
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: 'climbRung',
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: 'defenseRating',
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: 'wasDefended',
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: 'autoReject',
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: 'loseCommunication',
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: 'robotBreak',
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: 'yellowCard',
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: 'redCard',
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: 'endComment',
                dataType: tableau.dataTypeEnum.string,
            },
        ];

        var tableSchema = {
            id: 'matchData',
            alias: 'Match Forms',
            columns: cols,
        };

        schemaCallback([tableSchema]);
    };

    // Download the data
    myConnector.getData = function (table, doneCallback) {
        let tableData = [];
        let connectionData = JSON.parse(tableau.connectionData);
        fetch(`/matchData/getEventData/${connectionData.eventKey}/${tableau.password}`)
            .then((response) => response.json())
            .then((data) => {
                if (!data.Error) {
                    for (let i = 0; i < data.length; i++) {
                        tableData.push({
                            teamNumber: data[i].teamNumber,
                            matchNumber: data[i].matchNumber,
                            scouter: data[i].scouter,
                            station: data[i].station,
                            preLoadedCargo: data[i].preLoadedCargo,
                            startingPositionX: data[i].startingPosition.x,
                            startingPositionY: data[i].startingPosition.y,
                            missedAuto: data[i].missedAuto,
                            lowerCargoAuto: data[i].lowerCargoAuto,
                            upperCargoAuto: data[i].upperCargoAuto,
                            crossTarmac: data[i].crossTarmac,
                            autoComment: data[i].autoComment,
                            missedTele: data[i].missedTele,
                            lowerCargoTele: data[i].lowerCargoTele,
                            upperCargoTele: data[i].upperCargoTele,
                            climbTime: data[i].climbTime,
                            climbRung: data[i].climbRung,
                            defenseRating: data[i].defenseRating,
                            wasDefended: data[i].receivedDefense,
                            autoReject: data[i].autoReject,
                            loseCommunication: data[i].loseCommunication,
                            robotBreak: data[i].robotBreak,
                            yellowCard: data[i].yellowCard,
                            redCard: data[i].redCard,
                            endComment: data[i].endComment,
                        });
                    }
                    table.appendRows(tableData);
                    doneCallback();
                } else {
                    table.appendRows(tableData);
                    doneCallback();
                }
            })
            .catch(() => {
                table.appendRows(tableData);
                doneCallback();
            });
        // $.getJSON('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson', function (resp) {
        //     var feat = resp.features,
        //         tableData = [];
        //     // Iterate over the JSON object
        //     for (var i = 0, len = feat.length; i < len; i++) {
        //         tableData.push({
        //             id: feat[i].id,
        //             mag: feat[i].properties.mag,
        //             title: feat[i].properties.title,
        //             location: feat[i].geometry,
        //         });
        //     }
        //     table.appendRows(tableData);
        //     doneCallback();
        // });
    };

    tableau.registerConnector(myConnector);
    // Create event listeners for when the user submits the form
})();
