<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * CI Smarty
 *
 * Smarty templating for Codeigniter
 *
 * @package   CI Smarty
 * @author    Dwayne Charrington
 * @copyright Copyright (c) 2012 Dwayne Charrington and Github contributors
 * @link      http://ilikekillnerds.com
 * @license   http://www.apache.org/licenses/LICENSE-2.0.html
 * @version   2.0
 */

class Smartytest extends CI_Controller {

    public function __construct()
    {
        parent::__construct();
        // Se carga el archivo principal de idioma pasarlo al hook
        //$this->lang->load('front_end');
        $this->load->library('parser');
    }

    public function index()
    {    
        // Envio la correspondiente palabra del lenguaje
        //$data['prueba'] = $this->lang->line('comunity_home');
        
        // Load the template from the views directory
        $this->parser->parse("index.tpl", $data);
    }
    
    /**
     * Showing off Smarty 3 template inheritance features
     *
     */
    public function inheritance()
    {
        // Some example data
        $data['title'] = "The Smarty parser works with template inheritance!";
        $data['body']  = "This is body text to show that Smarty 3 template inheritance works with Smarty Parser.";
        
        // Load the template from the views directory
        $this->parser->parse("inheritancetest.tpl", $data);
        
    }

}