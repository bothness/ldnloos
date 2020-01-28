# London Loo Map

This app automatically maps data collected by [London Loo Codes](https://twitter.com/ldnloocodes). Their data can be found in [this spreadsheet](https://docs.google.com/spreadsheets/d/1NZc0IPV9SV_Wy9xoDckHbVDgJyeW2Str231Uz_e0Mg4/edit#gid=0).

The app works by pulling London Loo Codes data into [this Google spreadsheet](https://docs.google.com/spreadsheets/d/1rIdT5tZ0i559JqREQDv4wQBFQ8GY2NJaWApfIEGwZoI/edit), which automatically geocodes the coordinates of each location. This data is then loaded into the map (as a CSV file). The map and locations are rendered using [Leaflet](https://leafletjs.com/). The base map is provided by [OpenStreetMap](https://openstreetmap.org).
