<?php
// Class_CodyMySQL

class CodyMySQL
{
    protected $mysql;
    public $host;
    public $port;
    protected $user;
    private $pass;
    protected $database;

    function __construct($host = "127.0.0.1", $port = 3306, $user = "root", $pass = "12345678", $database = "database")
    {
        $this->host = $host;
        $this->port = $port;
        $this->user = $user;
        $this->pass = $pass;
        $this->database = $database;

        $this->mysql = new mysqli($host, $user, $pass, $database, $port);
        if (mysqli_connect_errno()) {
            return;
        }
        $this->mysql->set_charset('utf8mb4');
        $this->mysql->options(MYSQLI_OPT_INT_AND_FLOAT_NATIVE, true);
    }

    function query($sql)
    {
        return $this->mysql->query($sql);
    }

    function get($sql)
    {
        $res = $this->query($sql);
        if (!$res) {
            return false;
        }
        $ret = array();
        while ($row = $res->fetch_assoc()) {
            $ret[] = $row;
        }
        $res->close();
        return $ret;
    }

    function getrow($sql)
    {
        $res = $this->Query($sql);
        if (!$res) {
            return false;
        }
        $ret = $res->fetch_assoc();
        $res->close();
        return $ret;
    }

    function escape($value)
    {
        return $this->mysql->real_escape_string((string)$value);
    }

    private function quoteIdentifier($identifier)
    {
        if (!is_string($identifier) || preg_match('/^[A-Za-z0-9_]+$/', $identifier) !== 1) {
            return false;
        }

        return "`" . $identifier . "`";
    }

    function insert($data, $table)
    {
        $table_name = $this->quoteIdentifier($table);
        if ($table_name === false || !is_array($data) || empty($data)) {
            return false;
        }

        $columns = array();
        $values = array();
        foreach ($data as $key => $value) {
            $column_name = $this->quoteIdentifier((string)$key);
            if ($column_name === false) {
                return false;
            }

            $columns[] = $column_name;
            $values[] = "'" . $this->escape($value) . "'";
        }

        $sql = "INSERT INTO " . $table_name . " (" . implode(",", $columns) . ") VALUES (" . implode(",", $values) . ")";
        return $this->query($sql);
    }

    function update($data, $table, $where = "0")
    {
        $table_name = $this->quoteIdentifier($table);
        if ($table_name === false || !is_array($data) || empty($data)) {
            return false;
        }

        $sql = "UPDATE " . $table_name . " SET ";
        foreach ($data as $key => $value) {
            $column_name = $this->quoteIdentifier((string)$key);
            if ($column_name === false) {
                return false;
            }

            $sql .= $column_name . " = '" . $this->escape($value) . "',";
        }
        $sql = rtrim($sql, ',');
        $sql .= ' WHERE ' . $where;
        return $this->query($sql);
    }

    function close()
    {
        $this->mysql->close();
    }

    function __destruct()
    {
        $this->close();
    }
}
