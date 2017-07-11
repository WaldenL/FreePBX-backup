<?php
/**
 * Copyright Sangoma Technologies, Inc 2017
 */
namespace FreePBX\modules\Backup;

class BackupObject {
	private $data = array();

	public function __construct($freepbx = null) {
		if ($freepbx == null) {
			throw new \Exception('Not given a FreePBX Object');
		}
		$this->FreePBX = $freepbx;
	}

	public static function getFilePath($file) {
		$fullpath = '';
		if (empty($file['root'])) {
			if (!strncmp($file['path'], '/', 1)) {
				/* We have a full path, rather than a relative path. */
				$fullpath = $file['path'] . '/' . $file['filename'];
			}
		} else {
			$fullpath = $file['root'] . '/' . $file['path'] . '/' . $file['filename'];
		}

		return $fullpath;
	}

	/**
	array(
		'type' => '',		// The type of the file.  Something that the module can understand as something useful and do something with.
					// 'voicemail', 'greeting', 'libs'

		'filename' => '',	// It's a filename.  You know what a filename is.
					// 'data.dat', 'msg0001.wav', 'libtaco.so'

		'path' => '',		// Unless a full path is given, this is a relative path. It is left to the module to figure out where the file should go.
					// '', 'default/5000/INBOX', '/usr/lib/'

		'root' => '',		//
					// '', '__ASTETCDIR__', '__ASTSPOOLDIR__/voicemail/'
	);
	*/
	public function addBackupFiles($list) {
		if (empty($list)) {
			return;
		}

		foreach ($list as $file) {
			if (empty($file['type']) || empty($file['filename'])) {
				continue;
			}

			$fullpath = \FreePBX\modules\Backup\BackupObject::getFilePath($file);
			if (empty($fullpath)) {
				/* We couldn't create a valid path.  Skip it. */
				// TODO Fail?  Display warning?
				continue;
			}

			$this->data['files'][$fullpath] = $file;
		}
	}

	public function getBackupFiles() {
		return $this->data['files'];
	}
}
