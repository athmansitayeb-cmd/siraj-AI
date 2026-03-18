import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'dart:convert';
import 'package:audioplayers/audioplayers.dart';

class AssetsGallery extends StatefulWidget {
  @override
  _AssetsGalleryState createState() => _AssetsGalleryState();
}

class _AssetsGalleryState extends State<AssetsGallery> {
  List<String> images = [];
  List<String> audio = [];
  List<Map<String, dynamic>> jsonFiles = [];
  final AudioPlayer player = AudioPlayer();

  @override
  void initState() {
    super.initState();
    loadAssets();
  }

  Future<void> loadAssets() async {
    final manifestContent = await rootBundle.loadString('AssetManifest.json');
    final Map<String, dynamic> manifestMap = json.decode(manifestContent);

    images = manifestMap.keys.where((key) => key.startsWith('assets/images/')).toList();
    audio = manifestMap.keys.where((key) => key.startsWith('assets/audio/')).toList();
    final jsonPaths = manifestMap.keys.where((key) => key.startsWith('assets/json/')).toList();
    for (var path in jsonPaths) {
      final content = await rootBundle.loadString(path);
      jsonFiles.add(json.decode(content));
    }

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Assets Gallery')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Images:', style: TextStyle(fontWeight: FontWeight.bold)),
            GridView.count(
              crossAxisCount: 3,
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              children: images.map((img) => Padding(
                padding: EdgeInsets.all(4),
                child: Image.asset(img, fit: BoxFit.cover),
              )).toList(),
            ),
            SizedBox(height: 20),
            Text('Audio:', style: TextStyle(fontWeight: FontWeight.bold)),
            ...audio.map((a) => ListTile(
                  title: Text(a.split('/').last),
                  trailing: IconButton(
                    icon: Icon(Icons.play_arrow),
                    onPressed: () => player.play(AssetSource(a)),
                  ),
                )),
            SizedBox(height: 20),
            Text('JSON:', style: TextStyle(fontWeight: FontWeight.bold)),
            ...jsonFiles.map((j) => Padding(
                  padding: EdgeInsets.symmetric(vertical: 2),
                  child: Text(jsonEncode(j)),
                )),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    player.dispose();
    super.dispose();
  }
}
