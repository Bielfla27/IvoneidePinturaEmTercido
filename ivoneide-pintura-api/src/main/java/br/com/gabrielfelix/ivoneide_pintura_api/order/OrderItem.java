package br.com.gabrielfelix.ivoneide_pintura_api.order;

import java.math.BigDecimal;

import br.com.gabrielfelix.ivoneide_pintura_api.product.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "pedido_itens")
public class OrderItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "pedido_id", nullable = false)
	private Order pedido;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "produto_id", nullable = false)
	private Product produto;

	@Column(nullable = false)
	private Integer quantidade;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal precoUnitario;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal subtotal;

	public OrderItem() {
	}

	public OrderItem(Product produto, Integer quantidade, BigDecimal precoUnitario, BigDecimal subtotal) {
		this.produto = produto;
		this.quantidade = quantidade;
		this.precoUnitario = precoUnitario;
		this.subtotal = subtotal;
	}

	public Long getId() {
		return id;
	}

	public Order getPedido() {
		return pedido;
	}

	public void setPedido(Order pedido) {
		this.pedido = pedido;
	}

	public Product getProduto() {
		return produto;
	}

	public void setProduto(Product produto) {
		this.produto = produto;
	}

	public Integer getQuantidade() {
		return quantidade;
	}

	public void setQuantidade(Integer quantidade) {
		this.quantidade = quantidade;
	}

	public BigDecimal getPrecoUnitario() {
		return precoUnitario;
	}

	public void setPrecoUnitario(BigDecimal precoUnitario) {
		this.precoUnitario = precoUnitario;
	}

	public BigDecimal getSubtotal() {
		return subtotal;
	}

	public void setSubtotal(BigDecimal subtotal) {
		this.subtotal = subtotal;
	}
}
