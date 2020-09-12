<?php 
    class Year {
        public $yearID;

        public function __construct($id) {
            $this->yearID = $id;
        }

        public function getId() {
            return $this->yearID;
        }
    }
?>